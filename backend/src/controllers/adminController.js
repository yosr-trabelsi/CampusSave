const { auth, db } = require('../config/firebase');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ROLES, MERCHANT_STATUS, COLLECTIONS } = require('../utils/constants');
const {
  docToObject,
  getFullProfile,
  getMerchant,
  serverTimestamp,
} = require('../services/firebaseService');

const byCreatedAtDesc = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''));

// ---------------------------------------------------------------- UTILISATEURS

// GET /api/admin/users?role=&isActive=&limit=
exports.listUsers = asyncHandler(async (req, res) => {
  let ref = db.collection(COLLECTIONS.USERS);
  if (req.query.role) ref = ref.where('role', '==', req.query.role);
  if (req.query.isActive !== undefined) {
    ref = ref.where('isActive', '==', req.query.isActive === 'true');
  }

  const limit = parseInt(req.query.limit, 10) || 100;
  const snap = await ref.limit(limit).get();

  // Tri en memoire : evite de creer des index composites Firestore
  const users = snap.docs.map(docToObject).sort(byCreatedAtDesc);
  res.json({ success: true, count: users.length, data: users });
});

// GET /api/admin/users/:uid
exports.getUser = asyncHandler(async (req, res) => {
  const user = await getFullProfile(req.params.uid);
  if (!user) throw new AppError('Utilisateur introuvable.', 404);
  res.json({ success: true, data: user });
});

// PATCH /api/admin/users/:uid/status  { isActive: true|false }  -> bloquer / debloquer
exports.setUserStatus = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { isActive } = req.body;

  if (uid === req.user.uid) {
    throw new AppError('Vous ne pouvez pas modifier votre propre compte.', 400);
  }

  const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new AppError('Utilisateur introuvable.', 404);

  await userRef.update({ isActive, updatedAt: serverTimestamp() });
  await auth.updateUser(uid, { disabled: !isActive });
  if (!isActive) await auth.revokeRefreshTokens(uid);

  res.json({
    success: true,
    message: isActive ? 'Compte réactivé.' : 'Compte bloqué.',
  });
});

// DELETE /api/admin/users/:uid
exports.deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;

  if (uid === req.user.uid) {
    throw new AppError('Vous ne pouvez pas supprimer votre propre compte.', 400);
  }

  const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new AppError('Utilisateur introuvable.', 404);

  const batch = db.batch();
  batch.delete(userRef);
  if (snap.data().role === ROLES.MERCHANT) {
    batch.delete(db.collection(COLLECTIONS.MERCHANTS).doc(uid));
  }
  await batch.commit();

  try {
    await auth.deleteUser(uid);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
  }

  // NB : les offres / commandes liees a ce compte sont gerees par les autres modules.
  res.json({ success: true, message: 'Utilisateur supprimé.' });
});

// ------------------------------------------------------------------ COMMERCES

// GET /api/admin/merchants?status=pending|approved|rejected
exports.listMerchants = asyncHandler(async (req, res) => {
  let ref = db.collection(COLLECTIONS.MERCHANTS);
  if (req.query.status) ref = ref.where('status', '==', req.query.status);

  const limit = parseInt(req.query.limit, 10) || 100;
  const snap = await ref.limit(limit).get();

  const merchants = snap.docs.map(docToObject).sort(byCreatedAtDesc);
  res.json({ success: true, count: merchants.length, data: merchants });
});

// PATCH /api/admin/merchants/:id/approve
exports.approveMerchant = asyncHandler(async (req, res) => {
  const ref = db.collection(COLLECTIONS.MERCHANTS).doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) throw new AppError('Commerce introuvable.', 404);

  await ref.update({
    status: MERCHANT_STATUS.APPROVED,
    rejectionReason: null,
    validatedBy: req.user.uid,
    validatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Point d'extension : envoyer une notification FCM au commercant (notificationService)
  const merchant = await getMerchant(req.params.id);
  res.json({ success: true, message: 'Commerce validé.', data: merchant });
});

// PATCH /api/admin/merchants/:id/reject  { reason }
exports.rejectMerchant = asyncHandler(async (req, res) => {
  const ref = db.collection(COLLECTIONS.MERCHANTS).doc(req.params.id);
  const snap = await ref.get();
  if (!snap.exists) throw new AppError('Commerce introuvable.', 404);

  await ref.update({
    status: MERCHANT_STATUS.REJECTED,
    rejectionReason: req.body.reason,
    validatedBy: req.user.uid,
    validatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const merchant = await getMerchant(req.params.id);
  res.json({ success: true, message: 'Commerce refusé.', data: merchant });
});

// ----------------------------------------------------------------- STATISTIQUES

// GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const count = async (query) => (await query.count().get()).data().count;
  const users = db.collection(COLLECTIONS.USERS);
  const merchants = db.collection(COLLECTIONS.MERCHANTS);

  const [students, merchantUsers, admins, pending, approved, rejected] = await Promise.all([
    count(users.where('role', '==', ROLES.STUDENT)),
    count(users.where('role', '==', ROLES.MERCHANT)),
    count(users.where('role', '==', ROLES.ADMIN)),
    count(merchants.where('status', '==', MERCHANT_STATUS.PENDING)),
    count(merchants.where('status', '==', MERCHANT_STATUS.APPROVED)),
    count(merchants.where('status', '==', MERCHANT_STATUS.REJECTED)),
  ]);

  res.json({
    success: true,
    data: {
      users: { students, merchants: merchantUsers, admins },
      merchants: { pending, approved, rejected },
    },
  });
});