// Inscription + profil. La CONNEXION se fait côté client avec le SDK Firebase
// (signInWithEmailAndPassword) : le client récupère un ID token et l'envoie
// ensuite dans le header  Authorization: Bearer <token>.
const { auth, db } = require("../config/firebase");

// POST /api/auth/register  (public)
exports.register = async (req, res, next) => {
  const { email, password, name, role, phone, businessName, address } =
    req.body;

  let created;
  try {
    created = await auth.createUser({ email, password, displayName: name });
  } catch (err) {
    if (err.code === "auth/email-already-exists")
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    if (
      err.code === "auth/invalid-password" ||
      err.code === "auth/invalid-email"
    )
      return res.status(400).json({ message: err.message });
    return next(err);
  }

  try {
    // Seuls student et merchant sont autorisés à l'inscription publique
    const safeRole = role === "merchant" ? "merchant" : "student";
    // Un commerçant doit être validé par l'admin avant d'être actif
    const status = safeRole === "merchant" ? "pending" : "active";
    const profile = {
      uid: created.uid,
      email,
      name,
      role: safeRole,
      status,
      isActive: true,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      ...(safeRole === "merchant" && {
        businessName,
        address,
        approvalStatus: "pending",
      }),
    };

    const batch = db.batch();
    batch.set(db.collection("users").doc(created.uid), profile);
    if (safeRole === "merchant") {
      batch.set(db.collection("merchants").doc(created.uid), {
        uid: created.uid,
        businessName,
        address,
        approvalStatus: "pending",
        createdAt: profile.createdAt,
      });
    }
    await batch.commit();

    res.status(201).json({ uid: created.uid, role: safeRole, status });
  } catch (err) {
    // On annule le compte Auth si le profil n'a pas pu être créé
    await auth.deleteUser(created.uid).catch(() => {});
    next(err);
  }
};

// GET /api/auth/me  (connecté) : profil de l'utilisateur
exports.me = async (req, res, next) => {
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();
    if (!snap.exists)
      return res.status(404).json({ message: "Profil introuvable" });
    res.json(snap.data());
  } catch (err) {
    next(err);
  }
};
