const express = require('express');
const admin = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const {
  validate,
  uidParamRules,
  idParamRules,
  userStatusRules,
  rejectRules,
  listUsersRules,
  listMerchantsRules,
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Toutes les routes admin : connecte + role admin
router.use(authenticate, requireAdmin);

router.get('/stats', admin.getStats);

// Utilisateurs
router.get('/users', listUsersRules, validate, admin.listUsers);
router.get('/users/:uid', uidParamRules, validate, admin.getUser);
router.patch('/users/:uid/status', uidParamRules, userStatusRules, validate, admin.setUserStatus);
router.delete('/users/:uid', uidParamRules, validate, admin.deleteUser);

// Commerces
router.get('/merchants', listMerchantsRules, validate, admin.listMerchants);
router.patch('/merchants/:id/approve', idParamRules, validate, admin.approveMerchant);
router.patch('/merchants/:id/reject', idParamRules, rejectRules, validate, admin.rejectMerchant);

module.exports = router;