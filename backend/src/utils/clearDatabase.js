const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const { seedData } = require('../seeds/seedData');
const { getPersistentDbDir } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Resource = require('../models/Resource');
const logger = require('./logger');

const checkRunningServer = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: config.port || 5000,
      path: (config.apiPrefix || '/api/v1') + '/health',
      method: 'GET',
      timeout: 1500
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
};

const triggerServerReset = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: config.port || 5000,
      path: (config.apiPrefix || '/api/v1') + '/reset-marketplace',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '0'
      },
      timeout: 10000
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          resolve({ raw });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Reset request timed out'));
    });
    req.end();
  });
};

const runClearAndReset = async () => {
  let memoryServerInstance = null;
  try {
    logger.info('====================================================');
    logger.info('  CampusKart Database Cleaner & Initializer');
    logger.info('====================================================');

    // 1. Check if backend server is already running on port 5000
    const isServerRunning = await checkRunningServer();
    if (isServerRunning) {
      logger.info('Live CampusKart server detected on port 5000. Resetting via active database connection...');
      const response = await triggerServerReset();
      logger.info(response.message || 'Reset completed via active server.');
      logger.info('====================================================');
      logger.info('  DATABASE RESET COMPLETE & READY FOR NEW ENTRIES');
      logger.info('====================================================');
      logger.info('Categories Available: 3 (Cycles, Calculators, Other)');
      logger.info('Marketplace Products: 0 (Completely clean - ready for new entries)');
      logger.info('Accounts Ready:');
      logger.info('- Student: satyam.2026is22@mnnit.ac.in (Password: Password123)');
      logger.info('- Admin:   admin@mnnit.ac.in (Password: AdminPassword123)');
      logger.info('- Vendor:  vendor@mnnit.ac.in (Password: Password123)');
      logger.info('====================================================');
      process.exit(0);
      return;
    }

    // 2. If server is not running, connect directly
    let uri = config.mongodbUri;
    let connected = false;

    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      logger.info(`Connected to external MongoDB at ${uri}`);
      connected = true;
    } catch (e) {
      logger.info('No running external MongoDB found. Connecting to persistent embedded database...');
    }

    if (!connected) {
      const dbDir = getPersistentDbDir();
      const lockFile = path.join(dbDir, 'mongod.lock');
      if (fs.existsSync(lockFile)) {
        try { fs.unlinkSync(lockFile); } catch (e) {}
      }

      const cacheDir = path.resolve(__dirname, '../../node_modules/.cache/mongodb-memory-server');
      process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;
      process.env.MONGOMS_SYSTEM_BINARY = path.join(cacheDir, 'mongod-x64-win32-7.0.24.exe');

      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbPath: dbDir,
          storageEngine: 'wiredTiger'
        }
      });
      const memoryUri = memoryServerInstance.getUri();
      await mongoose.connect(memoryUri);
      logger.info(`Connected to embedded MongoDB at ${memoryUri} (storage: ${dbDir})`);
    }

    // Execute full database wipe and fresh setup
    await seedData();

    // Verify final counts
    const categoryCount = await Category.countDocuments();
    const userCount = await User.countDocuments();
    const resourceCount = await Resource.countDocuments();

    logger.info('====================================================');
    logger.info('  DATABASE RESET COMPLETE & READY FOR NEW ENTRIES');
    logger.info('====================================================');
    logger.info(`Categories Available: ${categoryCount} (Cycles, Calculators, Other)`);
    logger.info(`Campus Accounts:     ${userCount} (Student, Vendor, Admin)`);
    logger.info(`Marketplace Products: ${resourceCount} (Completely clean - 0 products)`);
    logger.info('Accounts Ready:');
    logger.info('- Student: satyam.2026is22@mnnit.ac.in (Password: Password123)');
    logger.info('- Admin:   admin@mnnit.ac.in (Password: AdminPassword123)');
    logger.info('- Vendor:  vendor@mnnit.ac.in (Password: Password123)');
    logger.info('You can now log in and add fresh listings via the UI!');
    logger.info('====================================================');

    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    process.exit(0);
  } catch (error) {
    logger.error(`Database clear error: ${error.message}`);
    if (memoryServerInstance) {
      try { await memoryServerInstance.stop(); } catch (e) {}
    }
    process.exit(1);
  }
};

runClearAndReset();
