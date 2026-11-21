const { db } = require('../config/firebase');
const qrTokenService = require('../services/qrTokenService');
const notificationService = require('../services/notificationService');

const httpError = (status, message) => Object.assign(new Error(message), { status });

const handle = (res, next, err) =>
  err.status ? res.status(err.status).json({ message: err.message }) : next(err);

// GET /api/qr/:orderId  (étudiant) : récupérer le QR de sa commande payée
exports.getOrderQr = async (req, res, next) => {
  try {
    const snap = await db.collection('orders').doc(req.params.orderId).get();
    if (!snap.exists) throw httpError(404, 'Commande introuvable');
    const order = snap.data();
    if (order.studentId !== req.user.uid) throw httpError(403, 'Accès refusé');
    if (order.paymentStatus && order.paymentStatus !== 'paid')
      throw httpError(402, 'Commande non payée');

    const { token, qrImage } = await qrTokenService.generateOrderQr(snap.id);
    res.json({ token, qrImage });
  } catch (err) { handle(res, next, err); }
};

// POST /api/qr/validate  (commerçant) : valider la récupération (usage unique)
exports.validateQr = async (req, res, next) => {
  try {
    const orderId = qrTokenService.verifyToken(req.body.token);
    if (!orderId) throw httpError(400, 'QR Code invalide');

    const ref = db.collection('orders').doc(orderId);

    // Transaction : deux scans simultanés ne peuvent pas valider deux fois
    const order = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw httpError(404, 'Commande introuvable');
      const data = snap.data();
      if (data.merchantId !== req.user.uid)
        throw httpError(403, 'Cette commande appartient à un autre commerçant');
      if (data.status === 'collected') throw httpError(409, 'Commande déjà récupérée');
      if (data.paymentStatus && data.paymentStatus !== 'paid')
        throw httpError(402, 'Commande non payée');

      tx.update(ref, { status: 'collected', collectedAt: new Date().toISOString() });
      return data;
    });

    // Une notification qui échoue ne doit pas annuler la validation
    notificationService
      .sendToUser({
        uid: order.studentId,
        title: 'Commande récupérée',
        body: "Merci d'avoir sauvé de la nourriture !",
        data: { orderId },
      })
      .catch((e) => console.error('Notification échouée :', e.message));

    res.json({ message: 'Récupération validée', orderId });
  } catch (err) { handle(res, next, err); }
};
