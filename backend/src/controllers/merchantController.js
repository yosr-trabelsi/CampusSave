const { db } = require('../config/firebase');

const applyForMerchant = async (req, res) => {
  try {
    const { businessName, description, address, phone } = req.body;

    if (!businessName || !address) {
      return res.status(400).json({
        error: 'Le nom du commerce et son adresse sont obligatoires.'
      });
    }

    const uid = req.user.uid;
    const userRef = db.collection('users').doc(uid);
    const merchantRef = db.collection('merchants').doc(uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'Utilisateur introuvable.'
      });
    }

    if (userDoc.data().role === 'merchant') {
      return res.status(409).json({
        error: 'Vous êtes déjà commerçant.'
      });
    }

    const existingApplication = await merchantRef.get();

    if (existingApplication.exists &&
        existingApplication.data().approvalStatus === 'pending') {
      return res.status(409).json({
        error: 'Une demande est déjà en attente.'
      });
    }

    const merchantData = {
      uid,
      businessName,
      description: description || '',
      address,
      phone: phone || '',
      approvalStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    await merchantRef.set(merchantData);

    await userRef.update({
      approvalStatus: 'pending'
    });

    return res.status(201).json({
      message: 'Demande envoyée pour validation.'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur lors de la demande commerçant.'
    });
  }
};

const getMerchantProfile = async (req, res) => {
  try {
    const merchantDoc = await db.collection('merchants')
      .doc(req.user.uid)
      .get();

    if (!merchantDoc.exists) {
      return res.status(404).json({
        error: 'Commerce introuvable.'
      });
    }

    return res.status(200).json(merchantDoc.data());

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur lors de la récupération du commerce.'
    });
  }
};

const updateMerchantProfile = async (req, res) => {
  try {
    const { businessName, description, address, phone } = req.body;

    const updates = {};

    if (businessName !== undefined) updates.businessName = businessName;
    if (description !== undefined) updates.description = description;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Aucune information à modifier.'
      });
    }

    await db.collection('merchants')
      .doc(req.user.uid)
      .update(updates);

    return res.status(200).json({
      message: 'Commerce modifié avec succès.'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur lors de la modification du commerce.'
    });
  }
};

module.exports = {
  applyForMerchant,
  getMerchantProfile,
  updateMerchantProfile
};