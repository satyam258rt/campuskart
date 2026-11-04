const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuskart').trim(),
  jwt: {
    secret: process.env.JWT_SECRET || 'campuskart_default_development_secret_key_12345',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  campusEmail: {
    required: process.env.REQUIRE_CAMPUS_EMAIL === 'true',
    allowedDomains: (process.env.ALLOWED_CAMPUS_DOMAINS || 'mnnit.ac.in')
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(Boolean)
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'mock',
    smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 2525,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@campuskart.edu',
    fromName: process.env.FROM_NAME || 'CampusKart Marketplace'
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || ''
  }
};

module.exports = config;
