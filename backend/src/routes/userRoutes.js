const express = require('express');
const { getMe, updateMe, saveFcmToken } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, updateProfileRules, fcmTokenRules } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', updateProfileRules, validate, updateMe);
router.put('/me/fcm-token', fcmTokenRules, validate, saveFcmToken);

module.exports = router;