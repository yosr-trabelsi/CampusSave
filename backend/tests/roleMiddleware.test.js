const test = require('node:test');
const assert = require('node:assert');
const allowRoles = require('../src/middleware/roleMiddleware');

function run(mw, user) {
  const res = { code: null, status(c) { this.code = c; return this; }, json(p) { this.body = p; return this; } };
  let next = false;
  mw({ user }, res, () => { next = true; });
  return { res, next };
}

test('autorise le bon rôle (chaîne simple)', () => {
  assert.ok(run(allowRoles('admin'), { role: 'admin' }).next);
});
test('accepte plusieurs rôles et la forme tableau', () => {
  assert.ok(run(allowRoles('admin', 'merchant'), { role: 'merchant' }).next);
  assert.ok(run(allowRoles(['student']), { role: 'student' }).next);
});
test('refuse un autre rôle (403)', () => {
  const { res, next } = run(allowRoles('admin'), { role: 'student' });
  assert.ok(!next);
  assert.strictEqual(res.code, 403);
});
test('refuse si pas de rôle ou pas d\'utilisateur', () => {
  assert.strictEqual(run(allowRoles('admin'), undefined).res.code, 403);
  assert.strictEqual(run(allowRoles('admin'), {}).res.code, 403);
});
test('pas de faux positif par sous-chaîne', () => {
  assert.ok(!run(allowRoles('admin'), { role: 'adm' }).next);
});
