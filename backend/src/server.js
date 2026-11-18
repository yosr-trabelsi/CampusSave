
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const offerRoutes = require('./routes/offerRoutes');
const orderRoutes = require('./routes/orderRoutes');

const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/test-body', (req, res) => {
  console.log('BODY REÇU :', req.body);

  res.status(200).json({
    received: req.body
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'CampusSave API fonctionne correctement.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CampusSave API démarrée sur le port ${PORT}`);
});
