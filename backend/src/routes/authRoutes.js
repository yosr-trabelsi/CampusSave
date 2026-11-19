const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, me, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, registerRules } = require('../middleware/validationMiddleware');

const router = express.Router();

// Limite les inscriptions abusives : 20 requetes / 15 min / IP
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard.' },
});

router.post('/register', registerLimiter, registerRules, validate, register);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

module.exports = router;