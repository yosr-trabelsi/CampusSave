const express = require('express');

const {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
} = require('../controllers/offerController');

const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getOffers);
router.get('/:id', getOfferById);

router.post('/', verifyToken, verifyRole('merchant'), createOffer);
router.put('/:id', verifyToken, verifyRole('merchant'), updateOffer);
router.delete('/:id', verifyToken, verifyRole('merchant'), deleteOffer);

module.exports = router;