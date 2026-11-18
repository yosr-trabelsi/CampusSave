// Version autonome (HMAC) : nouveau fichier, ne touche pas à qrService.js existant.
const crypto = require('crypto');

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET manquant dans .env');
  return process.env.JWT_SECRET;
};

const sign = (orderId) =>
  crypto.createHmac('sha256', secret()).update(orderId).digest('hex');

// Token = orderId.signature (impossible à falsifier sans le secret)
function createToken(orderId) {
  return `${orderId}.${sign(orderId)}`;
}

// Retourne l'orderId si le token est valide, sinon null
function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [orderId, signature] = token.split('.');
  if (!orderId || !signature) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(orderId));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return orderId;
}

async function generateOrderQr(orderId) {
  const QRCode = require('qrcode');
  const token = createToken(orderId);
  const qrImage = await QRCode.toDataURL(token, { errorCorrectionLevel: 'H', width: 300 });
  return { token, qrImage };
}

module.exports = { createToken, verifyToken, generateOrderQr };
