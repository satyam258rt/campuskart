const express = require('express');
const rentalController = require('../controllers/rentalController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public check availability
router.post('/check-availability', (req, res, next) =>
  rentalController.checkAvailability(req, res, next)
);

// Protected routes
router.use(protect);

router.post('/', (req, res, next) => rentalController.createRental(req, res, next));
router.get('/my-rentals', (req, res, next) => rentalController.getMyRentals(req, res, next));
router.get('/lessor-rentals', (req, res, next) => rentalController.getLessorRentals(req, res, next));
router.get('/:id', (req, res, next) => rentalController.getRentalById(req, res, next));
router.patch('/:id/activate', (req, res, next) => rentalController.activateRental(req, res, next));

module.exports = router;
