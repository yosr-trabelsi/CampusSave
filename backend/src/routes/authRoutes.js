const router = require('express').Router();
const { register, me } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const { validate, registerRules } = require('../middleware/validationMiddleware');

router.post('/register', validate(registerRules), register);
router.get('/me', auth, me);

module.exports = router;
