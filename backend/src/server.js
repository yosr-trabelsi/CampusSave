const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/environment');
require('./config/firebase'); // initialise Firebase Admin au demarrage

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const adminRoutes = require('./routes/adminRoutes');
// Routes des autres membres : decommenter quand les fichiers sont completes
// const offerRoutes = require('./routes/offerRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
if (config.env !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CampusSave API OK', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/offers', offerRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`CampusSave API démarrée sur http://localhost:${config.port}`);
  });
}

module.exports = app;