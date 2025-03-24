require('dotenv').config();

const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || '1.0.0',
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  copyCat: {
    storagePath: './storage',
    maxRecordings: 1000,
    defaultTimeout: 5000,
    mlService: {
      url: 'http://localhost:8001',
      timeout: 10000
    }
  }
};

// Validate required env vars
const requiredEnvVars = [];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

module.exports = config;
