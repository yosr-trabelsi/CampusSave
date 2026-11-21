const router = require('express').Router();
const { initPayment, webhook, getPaymentStatus } = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const { validate, initPaymentRules } = require('../middleware/validationMiddleware');

router.post('/init', auth, allowRoles('student'), validate(initPaymentRules), initPayment);
router.get('/webhook', webhook); // public : Konnect n'envoie pas de token
router.get('/:orderId/status', auth, allowRoles('student'), getPaymentStatus);

module.exports = router;
