const { db } = require('../config/firebase');

const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();

    const users = snapshot.docs.map(doc => doc.data());

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      error: 'Erreur lors de la récupération des utilisateurs.'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    if (!fullName && phone === undefined) {
      return res.status(400).json({
        error: 'Aucune information à modifier.'
      });
    }

    const updates = {};

    if (fullName !== undefined) updates.fullName = fullName;
    if (phone !== undefined) updates.phone = phone;

    const userRef = db.collection('users').doc(req.user.uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'Utilisateur introuvable.'
      });
    }

    await userRef.update(updates);

    return res.status(200).json({
      message: 'Profil mis à jour avec succès.'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur lors de la modification du profil.'
    });
  }
};

module.exports = {
  getUsers,
  updateProfile
};