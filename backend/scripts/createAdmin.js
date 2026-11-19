/**
 * Cree (ou promeut) un compte administrateur.
 * Usage : node scripts/createAdmin.js admin@campussave.tn "MotDePasse123" "Nom Admin"
 */
require('dotenv').config();
const { auth, db, admin } = require('../src/config/firebase');

(async () => {
  const [email, password, displayName = 'Administrateur CampusSave'] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage : node scripts/createAdmin.js <email> <motdepasse> [nom]');
    process.exit(1);
  }

  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log('Compte existant, promotion en admin...');
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
    user = await auth.createUser({ email, password, displayName, emailVerified: true });
    console.log('Compte Firebase créé.');
  }

  await auth.setCustomUserClaims(user.uid, { role: 'admin' });

  await db.collection('users').doc(user.uid).set(
    {
      uid: user.uid,
      email,
      displayName: user.displayName || displayName,
      role: 'admin',
      isActive: true,
      phone: null,
      university: null,
      fcmToken: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`Admin prêt : ${email} (uid: ${user.uid})`);
  process.exit(0);
})().catch((err) => {
  console.error('Erreur :', err.message);
  process.exit(1);
});