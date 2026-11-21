const { FieldValue } = require('firebase-admin/firestore');
const { db } = require('../config/firebase');

// POST /api/notifications/token : l'app envoie son token FCM
exports.saveToken = async (req, res, next) => {
  try {
    await db.collection('users').doc(req.user.uid).set(
      { fcmTokens: FieldValue.arrayUnion(req.body.fcmToken) },
      { merge: true }
    );
    res.json({ message: 'Token enregistré' });
  } catch (err) { next(err); }
};
