const { connectDB, disconnectDB } = require('../config/db');
const { seedData } = require('./seedData');
const logger = require('../utils/logger');

const run = async () => {
  try {
    await connectDB();
    await seedData();
    logger.info('Seed process completed successfully.');
  } catch (error) {
    logger.error(`Seed process failed: ${error.message}`);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();
