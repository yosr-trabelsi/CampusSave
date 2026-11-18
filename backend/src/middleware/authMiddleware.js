const { auth, db } = require('../config/firebase');

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Token manquant' });

    const decoded = await auth.verifyIdToken(header.split(' ')[1]);
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    req.user = { uid: decoded.uid, role: userDoc.exists ? userDoc.data().role : null };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};
