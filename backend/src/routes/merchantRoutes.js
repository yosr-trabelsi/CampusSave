const express = require('express');
const {
  listApproved,
  getMyShop,
  updateMyShop,
  getById,
} = require('../controllers/merchantController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireMerchant } = require('../middleware/roleMiddleware');
const { validate, updateShopRules, idParamRules } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', listApproved);

// "/me" doit etre declare AVANT "/:id"
router.get('/me', requireMerchant, getMyShop);
router.put('/me', requireMerchant, updateShopRules, validate, updateMyShop);

router.get('/:id', idParamRules, validate, getById);

module.exports = router;