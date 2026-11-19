require('dotenv').config();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  corsOrigin,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Les "\n" du .env doivent redevenir de vrais retours a la ligne
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '')
      .replace(/^"|"$/g, '')
      .replace(/\\n/g, '\n'),
  },
};