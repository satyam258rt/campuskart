const express = require('express');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const resourceRoutes = require('./resourceRoutes');
const rentalRoutes = require('./rentalRoutes');
const cartRoutes = require('./cartRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const returnRoutes = require('./returnRoutes');
const reviewRoutes = require('./reviewRoutes');
const notificationRoutes = require('./notificationRoutes');
const uploadRoutes = require('./uploadRoutes');
const adminRoutes = require('../modules/admin/adminRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusKart API',
    uptime: process.uptime()
  });
});

// Marketplace reset endpoint (Wipes listings/orders/uploads, restores categories & MNNIT accounts)
router.post('/reset-marketplace', async (req, res) => {
  try {
    const { seedData } = require('../seeds/seedData');
    await seedData();
    res.status(200).json({
      success: true,
      message: 'Database cleared and reset with 0 products. Cycles, Calculators, Other categories and MNNIT accounts ready.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/resources', resourceRoutes);
router.use('/rentals', rentalRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/returns', returnRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
