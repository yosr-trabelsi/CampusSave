// Tests d'intégration Backend A : auth, rôles, utilisateurs, commerces, admin.
const test = require('node:test');
const assert = require('node:assert');
const { installFakeFirebase } = require('./helpers/fakeFirebase');

const fake = installFakeFirebase();
const app = require('../src/app');

let server; let base;
test.before(async () => {
  await new Promise((ok) => { server = app.listen(0, ok); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

async function call(method, url, { token, body } = {}) {
  const res = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* vide */ }
  return { status: res.status, body: json };
}
const tok = (uid) => `tok:${uid}`;

const student = { email: 's@test.tn', password: 'motdepasse1', fullName: 'Étudiant Test', role: 'student' };
const merchant = {
  email: 'm@test.tn', password: 'motdepasse1', fullName: 'Resto Owner', role: 'merchant',
  businessName: 'Café ESSECT', address: 'Rue du Campus, Sfax',
};

let studentUid; let merchantUid; const adminUid = 'admin1';
test.before(() => {
  fake.store.set(`users/${adminUid}`, { uid: adminUid, email: 'a@test.tn', fullName: 'Admin', role: 'admin', isActive: true });
});

test('health', async () => {
  const r = await call('GET', '/api/health');
  assert.strictEqual(r.status, 200);
});

test('inscription étudiant : 201, rôle student, actif', async () => {
  const r = await call('POST', '/api/auth/register', { body: student });
  assert.strictEqual(r.status, 201);
  studentUid = r.body.uid;
  const doc = fake.store.get(`users/${studentUid}`);
  assert.strictEqual(doc.role, 'student');
  assert.strictEqual(doc.isActive, true);
  assert.strictEqual(doc.approvalStatus, undefined);
});

test('inscription : email déjà utilisé -> 409', async () => {
  const r = await call('POST', '/api/auth/register', { body: student });
  assert.strictEqual(r.status, 409);
});

test('inscription : rôle admin refusé, mot de passe court refusé', async () => {
  const a = await call('POST', '/api/auth/register', { body: { ...student, email: 'x@test.tn', role: 'admin' } });
  assert.strictEqual(a.status, 400);
  const b = await call('POST', '/api/auth/register', { body: { ...student, email: 'y@test.tn', password: '123' } });
  assert.strictEqual(b.status, 400);
  assert.ok(Array.isArray(b.body.errors));
});

test('inscription : "name" (ancien nom) accepté comme fullName', async () => {
  const { fullName, ...rest } = student;
  const r = await call('POST', '/api/auth/register', { body: { ...rest, email: 'n@test.tn', name: 'Ancien Nom' } });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(fake.store.get(`users/${r.body.uid}`).fullName, 'Ancien Nom');
});

test('inscription commerçant : pending + fiche commerce créée', async () => {
  const r = await call('POST', '/api/auth/register', { body: merchant });
  assert.strictEqual(r.status, 201);
  merchantUid = r.body.uid;
  assert.strictEqual(fake.store.get(`users/${merchantUid}`).approvalStatus, 'pending');
  assert.strictEqual(fake.store.get(`merchants/${merchantUid}`).approvalStatus, 'pending');
});

test('inscription commerçant sans nom de commerce -> 400', async () => {
  const { businessName, ...rest } = merchant;
  const r = await call('POST', '/api/auth/register', { body: { ...rest, email: 'm2@test.tn' } });
  assert.strictEqual(r.status, 400);
});

test('authentification : token absent / invalide -> 401', async () => {
  assert.strictEqual((await call('GET', '/api/auth/profile')).status, 401);
  assert.strictEqual((await call('GET', '/api/auth/profile', { token: 'nimporte' })).status, 401);
});

test('profil : retourne le profil sans tokens FCM', async () => {
  fake.store.set(`users/${studentUid}`, { ...fake.store.get(`users/${studentUid}`), fcmTokens: ['secret'] });
  const r = await call('GET', '/api/auth/profile', { token: tok(studentUid) });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.email, student.email);
  assert.strictEqual(r.body.fcmTokens, undefined);
  assert.strictEqual((await call('GET', '/api/auth/me', { token: tok(studentUid) })).status, 200);
});

test('profil : un token sans profil Firestore -> 403', async () => {
  const r = await call('GET', '/api/auth/profile', { token: tok('fantome') });
  assert.strictEqual(r.status, 403);
});

test('mise à jour du profil', async () => {
  const bad = await call('PUT', '/api/users/profile', { token: tok(studentUid), body: { phone: 'abc' } });
  assert.strictEqual(bad.status, 400);
  const ok = await call('PUT', '/api/users/profile', { token: tok(studentUid), body: { fullName: 'Nouveau Nom', phone: '+216 20 123 456' } });
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(fake.store.get(`users/${studentUid}`).fullName, 'Nouveau Nom');
});

test('rôles : un étudiant ne peut pas utiliser /admin (403)', async () => {
  assert.strictEqual((await call('GET', '/api/admin/users', { token: tok(studentUid) })).status, 403);
  assert.strictEqual((await call('GET', '/api/admin/users')).status, 401);
});

test('admin : liste des utilisateurs avec filtres, sans fcmTokens', async () => {
  const all = await call('GET', '/api/admin/users', { token: tok(adminUid) });
  assert.strictEqual(all.status, 200);
  assert.ok(all.body.length >= 3);
  assert.ok(all.body.every((u) => u.fcmTokens === undefined));
  const pend = await call('GET', '/api/admin/users?approvalStatus=pending', { token: tok(adminUid) });
  assert.deepStrictEqual(pend.body.map((u) => u.uid), [merchantUid]);
  assert.strictEqual((await call('GET', '/api/admin/users?role=nimporte', { token: tok(adminUid) })).status, 400);
});

test('commerce en attente : invisible du public', async () => {
  assert.deepStrictEqual((await call('GET', '/api/merchants')).body, []);
  assert.strictEqual((await call('GET', `/api/merchants/${merchantUid}`)).status, 404);
});

test('commerçant en attente : ne peut pas publier d\'offre', async () => {
  const r = await call('POST', '/api/offers', {
    token: tok(merchantUid),
    body: { title: 'Panier', price: 3, originalPrice: 6, quantity: 2, category: 'repas', pickupStart: '18:00', pickupEnd: '19:00' },
  });
  assert.ok([400, 403].includes(r.status), `statut inattendu ${r.status}`);
  assert.strictEqual([...fake.store.keys()].filter((k) => k.startsWith('offers/')).length, 0);
});

test('admin : validation d\'un commerçant', async () => {
  const admin = tok(adminUid);
  const list = await call('GET', '/api/admin/merchants?approvalStatus=pending', { token: admin });
  assert.strictEqual(list.body.length, 1);

  const ok = await call('PUT', `/api/admin/merchants/${merchantUid}/approve`, { token: admin });
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(fake.store.get(`merchants/${merchantUid}`).approvalStatus, 'approved');
  assert.strictEqual(fake.store.get(`users/${merchantUid}`).approvalStatus, 'approved');

  assert.strictEqual((await call('PUT', `/api/admin/merchants/${merchantUid}/approve`, { token: admin })).status, 409);
  assert.strictEqual((await call('PUT', '/api/admin/merchants/inconnu/approve', { token: admin })).status, 404);
});

test('commerce validé : visible du public (champs publics seulement)', async () => {
  const list = await call('GET', '/api/merchants');
  assert.strictEqual(list.body.length, 1);
  assert.strictEqual(list.body[0].businessName, 'Café ESSECT');
  assert.strictEqual(list.body[0].approvalStatus, undefined);
  assert.strictEqual((await call('GET', `/api/merchants/${merchantUid}`)).status, 200);
});

test('commerçant : consulte et modifie sa fiche', async () => {
  const t = tok(merchantUid);
  assert.strictEqual((await call('GET', '/api/merchants/profile', { token: t })).body.businessName, 'Café ESSECT');
  assert.strictEqual((await call('PUT', '/api/merchants/profile', { token: t, body: {} })).status, 400);
  assert.strictEqual((await call('PUT', '/api/merchants/profile', { token: t, body: { address: '   ' } })).status, 400);
  const ok = await call('PUT', '/api/merchants/profile', { token: t, body: { description: 'Sandwichs et pâtisseries' } });
  assert.strictEqual(ok.status, 200);
  // un étudiant n'a pas accès à la fiche commerçant
  assert.strictEqual((await call('GET', '/api/merchants/profile', { token: tok(studentUid) })).status, 403);
});

test('étudiant -> demande commerçant -> rejet -> modification -> renvoi -> approbation', async () => {
  const admin = tok(adminUid);
  const reg = await call('POST', '/api/auth/register', { body: { ...student, email: 'e2@test.tn' } });
  const uid = reg.body.uid; const t = tok(uid);

  assert.strictEqual((await call('POST', '/api/merchants/apply', { token: t, body: { businessName: 'X' } })).status, 400);
  const apply = { businessName: 'Pizza Campus', address: 'Av. Habib Bourguiba' };
  assert.strictEqual((await call('POST', '/api/merchants/apply', { token: t, body: apply })).status, 201);
  assert.strictEqual((await call('POST', '/api/merchants/apply', { token: t, body: apply })).status, 409);

  const rej = await call('PUT', `/api/admin/merchants/${uid}/reject`, { token: admin, body: { reason: 'Adresse incomplète' } });
  assert.strictEqual(rej.status, 200);
  assert.strictEqual(fake.store.get(`merchants/${uid}`).rejectionReason, 'Adresse incomplète');
  assert.strictEqual(fake.store.get(`users/${uid}`).role, 'student'); // pas encore commerçant

  // un étudiant rejeté peut redéposer une demande
  assert.strictEqual((await call('POST', '/api/merchants/apply', { token: t, body: apply })).status, 201);
  assert.strictEqual((await call('PUT', `/api/admin/merchants/${uid}/approve`, { token: admin })).status, 200);
  assert.strictEqual(fake.store.get(`users/${uid}`).role, 'merchant');
});

test('commerçant rejeté : modifier sa fiche la renvoie en validation', async () => {
  const admin = tok(adminUid);
  const reg = await call('POST', '/api/auth/register', { body: { ...merchant, email: 'm3@test.tn' } });
  const uid = reg.body.uid;
  await call('PUT', `/api/admin/merchants/${uid}/reject`, { token: admin, body: { reason: 'Photo manquante' } });
  const r = await call('PUT', '/api/merchants/profile', { token: tok(uid), body: { address: 'Nouvelle adresse complète' } });
  assert.strictEqual(r.body.approvalStatus, 'pending');
  assert.strictEqual(fake.store.get(`merchants/${uid}`).approvalStatus, 'pending');
  assert.strictEqual(fake.store.get(`users/${uid}`).approvalStatus, 'pending');
});

test('admin : désactiver un compte bloque ses requêtes', async () => {
  const admin = tok(adminUid);
  const off = await call('PUT', `/api/admin/users/${studentUid}/status`, { token: admin, body: { isActive: false } });
  assert.strictEqual(off.status, 200);
  assert.deepStrictEqual(fake.authCalls.updateUser.at(-1), [studentUid, { disabled: true }]);
  assert.strictEqual((await call('GET', '/api/auth/profile', { token: tok(studentUid) })).status, 403);

  await call('PUT', `/api/admin/users/${studentUid}/status`, { token: admin, body: { isActive: true } });
  assert.strictEqual((await call('GET', '/api/auth/profile', { token: tok(studentUid) })).status, 200);
});

test('admin : garde-fous (soi-même, type invalide, admin, inconnu)', async () => {
  const admin = tok(adminUid);
  assert.strictEqual((await call('PUT', `/api/admin/users/${adminUid}/status`, { token: admin, body: { isActive: false } })).status, 400);
  assert.strictEqual((await call('PUT', `/api/admin/users/${studentUid}/status`, { token: admin, body: { isActive: 'non' } })).status, 400);
  assert.strictEqual((await call('PUT', '/api/admin/users/inconnu/status', { token: admin, body: { isActive: false } })).status, 404);
  assert.strictEqual((await call('DELETE', `/api/admin/users/${adminUid}`, { token: admin })).status, 400);
  fake.store.set('users/admin2', { uid: 'admin2', role: 'admin', isActive: true });
  assert.strictEqual((await call('DELETE', '/api/admin/users/admin2', { token: admin })).status, 403);
});

test('admin : suppression d\'un utilisateur (profil + fiche commerce + compte Auth)', async () => {
  const r = await call('DELETE', `/api/admin/users/${merchantUid}`, { token: tok(adminUid) });
  assert.strictEqual(r.status, 200);
  assert.ok(!fake.store.has(`users/${merchantUid}`));
  assert.ok(!fake.store.has(`merchants/${merchantUid}`));
  assert.ok(fake.authCalls.deleteUser.includes(merchantUid));
});

test('route inconnue et JSON invalide', async () => {
  assert.strictEqual((await call('GET', '/api/nimporte')).status, 404);
  const res = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{pas du json' });
  assert.strictEqual(res.status, 400);
});
