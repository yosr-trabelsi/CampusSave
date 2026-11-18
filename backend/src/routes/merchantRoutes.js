const express = require('express');

const {
  applyForMerchant,
  getMerchantProfile,
  updateMerchantProfile
} = require('../controllers/merchantController');

const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/apply', verifyToken, verifyRole('student'), applyForMerchant);

router.get(
  '/profile',
  verifyToken,
  verifyRole('merchant'),
  getMerchantProfile
);

router.put(
  '/profile',
  verifyToken,
  verifyRole('merchant'),
  updateMerchantProfile
);

module.exports = router;