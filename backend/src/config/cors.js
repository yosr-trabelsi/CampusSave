const cors = require('cors');

module.exports = cors({
  origin: process.env.WEB_URL || 'http://localhost:5173', // Vite
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
