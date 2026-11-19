const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { ROLES, MERCHANT_STATUS } = require('../utils/constants');

// A placer apres les regles de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new AppError('Données invalides.', 422, details));
};

const isMerchant = body('role').equals(ROLES.MERCHANT);
const isStudent = body('role').equals(ROLES.STUDENT);

const registerRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Email invalide.'),
  body('password').isLength({ min: 8, max: 64 }).withMessage('Mot de passe : 8 à 64 caractères.'),
  body('displayName').trim().isLength({ min: 2, max: 80 }).withMessage('Nom : 2 à 80 caractères.'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\s-]{8,15}$/)
    .withMessage('Numéro de téléphone invalide.'),
  body('role')
    .isIn([ROLES.STUDENT, ROLES.MERCHANT])
    .withMessage('Rôle invalide (student ou merchant).'),
  body('university').if(isStudent).optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('shopName').if(isMerchant).trim().isLength({ min: 2, max: 100 }).withMessage('Nom du commerce requis.'),
  body('address').if(isMerchant).trim().isLength({ min: 3, max: 200 }).withMessage('Adresse du commerce requise.'),
  body('category').if(isMerchant).optional({ checkFalsy: true }).trim().isLength({ max: 60 }),
  body('shopPhone')
    .if(isMerchant)
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\s-]{8,15}$/)
    .withMessage('Téléphone du commerce invalide.'),
  body('description').if(isMerchant).optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

const updateProfileRules = [
  body('displayName').optional().trim().isLength({ min: 2, max: 80 }),
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[0-9+\s-]{8,15}$/).withMessage('Numéro de téléphone invalide.'),
  body('university').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
];

const fcmTokenRules = [
  body('fcmToken').isString().trim().isLength({ min: 10, max: 4096 }).withMessage('Token FCM invalide.'),
];

const updateShopRules = [
  body('shopName').optional().trim().isLength({ min: 2, max: 100 }),
  body('address').optional().trim().isLength({ min: 3, max: 200 }),
  body('category').optional({ checkFalsy: true }).trim().isLength({ max: 60 }),
  body('shopPhone').optional({ checkFalsy: true }).trim().matches(/^[0-9+\s-]{8,15}$/).withMessage('Téléphone invalide.'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

const uidParamRules = [param('uid').isString().trim().notEmpty().isLength({ max: 128 })];
const idParamRules = [param('id').isString().trim().notEmpty().isLength({ max: 128 })];

const userStatusRules = [
  body('isActive').isBoolean({ strict: true }).withMessage('isActive doit être un booléen.'),
];

const rejectRules = [
  body('reason').trim().isLength({ min: 3, max: 300 }).withMessage('Motif du refus : 3 à 300 caractères.'),
];

const listUsersRules = [
  query('role').optional().isIn(Object.values(ROLES)),
  query('isActive').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 200 }),
];

const listMerchantsRules = [
  query('status').optional().isIn(Object.values(MERCHANT_STATUS)),
  query('limit').optional().isInt({ min: 1, max: 200 }),
];

module.exports = {
  validate,
  registerRules,
  updateProfileRules,
  fcmTokenRules,
  updateShopRules,
  uidParamRules,
  idParamRules,
  userStatusRules,
  rejectRules,
  listUsersRules,
  listMerchantsRules,
};