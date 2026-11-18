const { db, auth } = require('../config/firebase');

const registerUser = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body || {};

    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Email, mot de passe et nom complet sont obligatoires.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères.'
      });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName
    });

    const userData = {
      uid: userRecord.uid,
      fullName,
      email,
      phone: phone || '',
      role: 'student',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    try {
      await db.collection('users')
        .doc(userRecord.uid)
        .set(userData);
    } catch (firestoreError) {
      await auth.deleteUser(userRecord.uid);
      throw firestoreError;
    }

    return res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      uid: userRecord.uid,
      role: 'student'
    });

  } catch (error) {
    console.error('ERREUR COMPLETE :', error);
    console.error('CODE ERREUR :', error.code);
    console.error('MESSAGE :', error.message); 

    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        error: 'Cette adresse email est déjà utilisée.'
      });
    }

    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        error: 'Adresse email invalide.'
      });
    }

    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères.'
      });
    }

    return res.status(500).json({
      error: 'Erreur serveur lors de la création du compte.'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        error: 'Utilisateur non authentifié.'
      });
    }

    const uid = req.user.uid;

    const userDoc = await db.collection('users')
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'Utilisateur introuvable.'
      });
    }

    return res.status(200).json(userDoc.data());

  } catch (error) {
    console.error('Erreur lors de la récupération du profil :', error);

    return res.status(500).json({
      error: 'Erreur serveur lors de la récupération du profil.'
    });
  }
};

module.exports = {
  registerUser,
  getProfile
};