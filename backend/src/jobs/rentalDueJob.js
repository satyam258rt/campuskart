const Rental = require('../models/Rental');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

const checkOverdueRentals = async () => {
  try {
    const now = new Date();
    const overdueRentals = await Rental.find({
      status: 'ACTIVE',
      endDate: { $lt: now }
    }).populate(['resource', 'renter']);

    for (const rental of overdueRentals) {
      rental.status = 'OVERDUE';
      await rental.save();

      // Create alert notification
      await Notification.create({
        recipient: rental.renter._id,
        type: 'OVERDUE_ALERT',
        title: 'Rental Overdue Notice',
        message: `Your rental period for "${rental.resource.title}" ended on ${rental.endDate.toDateString()}. Please initiate return immediately to avoid late fees.`,
        link: `/rentals/${rental._id}`
      });
    }

    if (overdueRentals.length > 0) {
      logger.info(`Automated Job: Marked ${overdueRentals.length} rentals as OVERDUE.`);
    }
  } catch (error) {
    logger.error(`Automated Job Error: ${error.message}`);
  }
};

const startJobs = () => {
  // Run once on startup, then every 1 hour
  checkOverdueRentals();
  setInterval(checkOverdueRentals, 60 * 60 * 1000);
};

module.exports = {
  checkOverdueRentals,
  startJobs
};
