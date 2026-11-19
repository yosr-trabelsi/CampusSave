const { db } = require('../config/firebase');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ROLES, MERCHANT_STATUS, COLLECTIONS } = require('../utils/constants');
const { docToObject, getMerchant, serverTimestamp } = require('../services/firebaseService');

// GET /api/merchants  - liste des commerces valides
exports.listApproved = asyncHandler(async (req, res) => {
  const snap = await db
    .collection(COLLECTIONS.MERCHANTS)
    .where('status', '==', MERCHANT_STATUS.APPROVED)
    .get();

  const merchants = snap.docs.map(docToObject);
  res.json({ success: true, count: merchants.length, data: merchants });
});

// GET /api/merchants/me  - mon commerce (meme en attente / refuse)
exports.getMyShop = asyncHandler(async (req, res) => {
  const merchant = await getMerchant(req.user.uid);
  if (!merchant) throw new AppError('Commerce introuvable.', 404);
  res.json({ success: true, data: merchant });
});

// PUT /api/merchants/me  - modifier mon commerce
exports.updateMyShop = asyncHandler(async (req, res) => {
  const allowed = ['shopName', 'category', 'address', 'shopPhone', 'description'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field] || null;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('Aucun champ à mettre à jour.', 400);
  }

  updates.updatedAt = serverTimestamp();
  await db.collection(COLLECTIONS.MERCHANTS).doc(req.user.uid).update(updates);

  const merchant = await getMerchant(req.user.uid);
  res.json({ success: true, message: 'Commerce mis à jour.', data: merchant });
});

// GET /api/merchants/:id
exports.getById = asyncHandler(async (req, res) => {
  const merchant = await getMerchant(req.params.id);
  const canSeeAll = req.user.role === ROLES.ADMIN || req.user.uid === req.params.id;

  if (!merchant || (merchant.status !== MERCHANT_STATUS.APPROVED && !canSeeAll)) {
    throw new AppError('Commerce introuvable.', 404);
  }
  res.json({ success: true, data: merchant });
});