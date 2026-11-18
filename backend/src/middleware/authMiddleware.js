
const { auth, db } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Accès refusé. Token manquant ou invalide.'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db.collection('users')
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'Profil utilisateur introuvable.'
      });
    }

    const userData = userDoc.data();

    if (userData.isActive === false) {
      return res.status(403).json({
        error: 'Compte désactivé.'
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role,
      fullName: userData.fullName
    };

    next();

  } catch (error) {
    console.error('ERREUR AUTHENTIFICATION :', error.message);
    console.error('CODE :', error.code);

    return res.status(403).json({
      error: 'Token invalide ou expiré.',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
};

module.exports = verifyToken;
