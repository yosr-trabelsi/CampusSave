const { admin, db, auth } = require('../config/firebase');
const AppError = require('../utils/AppError');
const { ROLES, MERCHANT_STATUS, COLLECTIONS } = require('../utils/constants');

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

// Convertit les Timestamp Firestore en chaines ISO pour le JSON
function serialize(data) {
  if (!data) return data;
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = value && typeof value.toDate === 'function'
      ? value.toDate().toISOString()
      : value;
  }
  return out;
}

const docToObject = (snap) => (snap.exists ? { id: snap.id, ...serialize(snap.data()) } : null);

async function getUserProfile(uid) {
  const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  return docToObject(snap);
}

async function getMerchant(id) {
  const snap = await db.collection(COLLECTIONS.MERCHANTS).doc(id).get();
  return docToObject(snap);
}

// Profil complet : utilisateur + commerce si role commercant
async function getFullProfile(uid) {
  const user = await getUserProfile(uid);
  if (!user) return null;
  if (user.role === ROLES.MERCHANT) {
    user.merchant = await getMerchant(uid);
  }
  return user;
}

/**
 * Cree un compte Firebase Auth + le profil Firestore (+ le commerce si commercant).
 * Annule la creation Auth si l'ecriture Firestore echoue.
 */
async function createAccount({ email, password, displayName, phone, role, university, shop }) {
  let userRecord;
  try {
    userRecord = await auth.createUser({ email, password, displayName });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      throw new AppError('Cet email est déjà utilisé.', 409);
    }
    if (err.code === 'auth/invalid-password') {
      throw new AppError('Mot de passe invalide (6 caractères minimum).', 400);
    }
    throw err;
  }

  const uid = userRecord.uid;

  try {
    // Le role est aussi stocke dans les custom claims (utile pour les regles Firestore)
    await auth.setCustomUserClaims(uid, { role });

    const batch = db.batch();
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);

    batch.set(userRef, {
      uid,
      email,
      displayName,
      phone: phone || null,
      role,
      isActive: true,
      university: role === ROLES.STUDENT ? university || null : null,
      fcmToken: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (role === ROLES.MERCHANT) {
      batch.set(db.collection(COLLECTIONS.MERCHANTS).doc(uid), {
        ownerId: uid,
        shopName: shop.shopName,
        category: shop.category || null,
        address: shop.address,
        shopPhone: shop.shopPhone || phone || null,
        description: shop.description || null,
        status: MERCHANT_STATUS.PENDING,
        rejectionReason: null,
        validatedBy: null,
        validatedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (err) {
    await auth.deleteUser(uid).catch(() => {});
    throw err;
  }

  return uid;
}

module.exports = {
  admin,
  db,
  auth,
  serverTimestamp,
  serialize,
  docToObject,
  getUserProfile,
  getMerchant,
  getFullProfile,
  createAccount,
};