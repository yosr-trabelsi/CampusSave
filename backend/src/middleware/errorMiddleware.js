const config = require('../config/environment');
const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Route introuvable : ${req.method} ${req.originalUrl}`, 404));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur.';

  // Erreurs Firebase courantes
  if (err.code === 'auth/user-not-found') {
    status = 404;
    message = 'Utilisateur introuvable.';
  } else if (err.code === 'auth/email-already-exists') {
    status = 409;
    message = 'Cet email est déjà utilisé.';
  }

  // JSON invalide dans le body
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Corps de requête JSON invalide.';
  }

  if (status >= 500) {
    console.error('[ERREUR]', err);
    if (config.env === 'production') message = 'Erreur interne du serveur.';
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.details ? { errors: err.details } : {}),
    ...(config.env !== 'production' && status >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };