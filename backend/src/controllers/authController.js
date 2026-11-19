const { auth } = require('../config/firebase');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const { createAccount, getFullProfile } = require('../services/firebaseService');

// POST /api/auth/register  (public) - etudiant ou commercant uniquement
exports.register = asyncHandler(async (req, res) => {
  const { email, password, displayName, phone, role, university } = req.body;
  const { shopName, category, address, shopPhone, description } = req.body;

  const uid = await createAccount({
    email,
    password,
    displayName,
    phone,
    role,
    university,
    shop: { shopName, category, address, shopPhone, description },
  });

  const message =
    role === ROLES.MERCHANT
      ? "Compte commerçant créé. Il sera actif après validation par l'administrateur."
      : 'Compte étudiant créé avec succès.';

  res.status(201).json({
    success: true,
    message,
    data: { uid, email, role },
  });
});

// GET /api/auth/me  (connecte)
exports.me = asyncHandler(async (req, res) => {
  const profile = await getFullProfile(req.user.uid);
  if (!profile) throw new AppError('Profil introuvable.', 404);
  res.json({ success: true, data: profile });
});

// POST /api/auth/logout  (connecte) - revoque les refresh tokens
exports.logout = asyncHandler(async (req, res) => {
  await auth.revokeRefreshTokens(req.user.uid);
  res.json({ success: true, message: 'Déconnexion effectuée.' });
});