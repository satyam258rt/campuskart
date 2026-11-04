const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! Shutting down... ${err.name}: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`CampusKart API Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}${config.apiPrefix}/health`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`UNHANDLED REJECTION! Shutting down... ${err.name}: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle termination signals
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Closing HTTP server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
