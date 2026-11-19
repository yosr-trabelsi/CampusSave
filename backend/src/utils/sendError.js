// Réponse d'erreur unifiée.
// `error` est le format documenté ; `message` est conservé car une partie
// du code (paiement, QR) et des fronts peut encore le lire.
module.exports = (res, status, text, extra = {}) =>
  res.status(status).json({ error: text, message: text, ...extra });
