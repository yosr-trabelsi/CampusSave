const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  return res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur.'
  });
};

module.exports = errorMiddleware;