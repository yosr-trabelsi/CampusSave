const { auth, db } = require('../config/firebase');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { COLLECTIONS } = require('../utils/constants');

/**
 * Verifie le token Firebase (Authorization: Bearer <idToken>),
 * charge le profil Firestore et remplit req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError("Token d'authentification manquant.", 401);
  }

  let decoded;
  try {
    // true = refuse aussi les tokens revoques / comptes desactives
    decoded = await auth.verifyIdToken(token, true);
  } catch (err) {
    throw new AppError('Token invalide ou expiré.', 401);
  }

  const snap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
  if (!snap.exists) {
    throw new AppError('Profil utilisateur introuvable.', 403);
  }

  const profile = snap.data();
  if (profile.isActive === false) {
    throw new AppError('Compte désactivé. Contactez un administrateur.', 403);
  }

  // Le role vient de Firestore (source de verite)
  req.user = {
    uid: decoded.uid,
    email: decoded.email,
    role: profile.role,
    displayName: profile.displayName,
  };
  next();
});

module.exports = { authenticate };