const app = require('../backend/src/app');
const { connectDB } = require('../backend/src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection failed in Vercel serverless function:', err.message);
  }
  return app(req, res);
};
