const express = require('express');

const {
  getAllUsers,
  approveMerchant,
  rejectMerchant,
  updateUserStatus
} = require('../controllers/adminController');

const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(verifyToken, verifyRole('admin'));

router.get('/users', getAllUsers);
router.put('/users/:uid/status', updateUserStatus);
router.put('/merchants/:uid/approve', approveMerchant);
router.put('/merchants/:uid/reject', rejectMerchant);

module.exports = router;