const { db } = require('../config/firebase');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES, MERCHANT_STATUS, COLLECTIONS } = require('../utils/constants');

// Usage : router.get('/x', authenticate, requireRole('admin', 'merchant'), handler)
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Non authentifié.', 401));
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Accès refusé : rôle insuffisant.', 403));
  }
  next();
};

// Commercant dont le commerce a ete valide par l'admin (ex : creer des offres)
const requireApprovedMerchant = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.MERCHANT) {
    throw new AppError('Accès réservé aux commerçants.', 403);
  }

  const snap = await db.collection(COLLECTIONS.MERCHANTS).doc(req.user.uid).get();
  if (!snap.exists) throw new AppError('Commerce introuvable.', 403);

  const merchant = snap.data();
  if (merchant.status === MERCHANT_STATUS.PENDING) {
    throw new AppError("Votre commerce est en attente de validation par l'administrateur.", 403);
  }
  if (merchant.status === MERCHANT_STATUS.REJECTED) {
    throw new AppError("Votre commerce a été refusé par l'administrateur.", 403);
  }

  req.merchant = { id: snap.id, ...merchant };
  next();
});

module.exports = {
  requireRole,
  requireStudent: requireRole(ROLES.STUDENT),
  requireMerchant: requireRole(ROLES.MERCHANT),
  requireAdmin: requireRole(ROLES.ADMIN),
  requireApprovedMerchant,
};