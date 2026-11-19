const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const config = require('./environment');

function buildCredential() {
  const { projectId, clientEmail, privateKey } = config.firebase;

  // 1) Variables d'environnement (.env)
  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({ projectId, clientEmail, privateKey });
  }

  // 2) Fichier serviceAccountKey.json a la racine de backend/ (ignore par Git)
  const keyPath = path.join(__dirname, '..', '..', 'serviceAccountKey.json');
  if (fs.existsSync(keyPath)) {
    return admin.credential.cert(require(keyPath));
  }

  throw new Error(
    'Configuration Firebase manquante : renseignez FIREBASE_PROJECT_ID, ' +
      'FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY dans .env ' +
      '(ou ajoutez backend/serviceAccountKey.json).'
  );
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: buildCredential() });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
const auth = admin.auth();

module.exports = { admin, db, auth };