
const admin = require('firebase-admin');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getMessaging } = require('firebase-admin/messaging');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const firebaseConfigured = process.env.FIREBASE_ENABLED === 'true';

let app = null;
let db = null;
let auth = null;
let messaging = null;

if (firebaseConfigured) {
  app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });

  db = getFirestore(app);
  auth = getAuth(app);
  messaging = getMessaging(app);

  console.log('Firebase initialized');
} else {
  console.log('Firebase disabled in development');
}

module.exports = {
  admin,
  app,
  db,
  auth,
  messaging,
  firebaseConfigured,
};
