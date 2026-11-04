const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const os = require('os');
const config = require('./env');
const logger = require('../utils/logger');
const User = require('../models/User');
const Category = require('../models/Category');

let memoryServerInstance = null;

const ensureInitialSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    if (userCount === 0 || categoryCount === 0) {
      logger.info('Database empty or missing default categories. Initializing fresh setup...');
      const { seedData } = require('../seeds/seedData');
      await seedData();
    } else {
      logger.info(`Database healthy (${userCount} campus accounts, ${categoryCount} categories). Existing user listings preserved.`);
    }
  } catch (seedErr) {
    logger.warn(`Initial database check skipped: ${seedErr.message}`);
  }
};

const getPersistentDbDir = () => {
  const baseDir = process.env.LOCALAPPDATA || os.homedir();
  const dbDir = path.join(baseDir, 'CampusKart', 'mongo-data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  return dbDir;
};

const connectDB = async (uri = config.mongodbUri) => {
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Check if initial seeding is needed without wiping existing listings
    await ensureInitialSeed();

    return conn;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      logger.warn(`Could not connect to external MongoDB at ${uri}: ${error.message}`);
      logger.info('Starting embedded MongoDB with local persistent storage for zero-config campus development...');
      try {
        const cacheDir = path.resolve(__dirname, '../../node_modules/.cache/mongodb-memory-server');
        process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;
        process.env.MONGOMS_SYSTEM_BINARY = path.join(cacheDir, 'mongod-x64-win32-7.0.24.exe');

        // Store persistent database outside of OneDrive in LocalAppData to prevent file locking issues
        const dbDir = getPersistentDbDir();

        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create({
          instance: {
            dbPath: dbDir,
            storageEngine: 'wiredTiger'
          }
        });
        const memoryUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memoryUri);
        logger.info(`Embedded MongoDB Connected successfully with persistence (${dbDir}): ${memoryUri}`);

        // Seed initial categories & campus accounts if database is fresh
        await ensureInitialSeed();

        return conn;
      } catch (memError) {
        logger.error(`Failed to start embedded database: ${memError.message}`);
        process.exit(1);
      }
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`Database disconnect error: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getPersistentDbDir
};
