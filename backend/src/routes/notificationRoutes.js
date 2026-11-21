const router = require('express').Router();
const { saveToken } = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');
const { validate, fcmTokenRules } = require('../middleware/validationMiddleware');

router.post('/token', auth, validate(fcmTokenRules), saveToken);

module.exports = router;
