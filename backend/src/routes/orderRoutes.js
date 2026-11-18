const express = require('express');

const {
  createOrder,
  getMyOrders,
  getMerchantOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', verifyToken, verifyRole('student'), createOrder);

router.get('/my-orders', verifyToken, verifyRole('student'), getMyOrders);

router.get(
  '/merchant-orders',
  verifyToken,
  verifyRole('merchant'),
  getMerchantOrders
);

router.put(
  '/:id/status',
  verifyToken,
  verifyRole('merchant'),
  updateOrderStatus
);

module.exports = router;