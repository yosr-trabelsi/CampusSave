const router = require('express').Router();
const { getOrderQr, validateQr } = require('../controllers/qrController');
const auth = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const { validate, qrValidateRules } = require('../middleware/validationMiddleware');

router.get('/:orderId', auth, allowRoles('student'), getOrderQr);
router.post('/validate', auth, allowRoles('merchant'), validate(qrValidateRules), validateQr);

module.exports = router;
