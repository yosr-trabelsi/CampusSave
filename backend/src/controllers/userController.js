const { auth, db } = require('../config/firebase');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ROLES, COLLECTIONS } = require('../utils/constants');
const { getFullProfile, serverTimestamp } = require('../services/firebaseService');

// GET /api/users/me
exports.getMe = asyncHandler(async (req, res) => {
  const profile = await getFullProfile(req.user.uid);
  if (!profile) throw new AppError('Profil introuvable.', 404);
  res.json({ success: true, data: profile });
});

// PUT /api/users/me
exports.updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.displayName !== undefined) updates.displayName = req.body.displayName;
  if (req.body.phone !== undefined) updates.phone = req.body.phone || null;
  if (req.body.university !== undefined && req.user.role === ROLES.STUDENT) {
    updates.university = req.body.university || null;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('Aucun champ à mettre à jour.', 400);
  }

  updates.updatedAt = serverTimestamp();
  await db.collection(COLLECTIONS.USERS).doc(req.user.uid).update(updates);

  if (updates.displayName) {
    await auth.updateUser(req.user.uid, { displayName: updates.displayName });
  }

  const profile = await getFullProfile(req.user.uid);
  res.json({ success: true, message: 'Profil mis à jour.', data: profile });
});

// PUT /api/users/me/fcm-token  (notifications push - Firebase Cloud Messaging)
exports.saveFcmToken = asyncHandler(async (req, res) => {
  await db.collection(COLLECTIONS.USERS).doc(req.user.uid).update({
    fcmToken: req.body.fcmToken,
    updatedAt: serverTimestamp(),
  });
  res.json({ success: true, message: 'Token de notification enregistré.' });
});