const ROLES = Object.freeze({
  STUDENT: 'student',
  MERCHANT: 'merchant',
  ADMIN: 'admin',
});

const MERCHANT_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const COLLECTIONS = Object.freeze({
  USERS: 'users',
  MERCHANTS: 'merchants',
  OFFERS: 'offers',
  ORDERS: 'orders',
});

module.exports = { ROLES, MERCHANT_STATUS, COLLECTIONS };