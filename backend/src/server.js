require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./config/firebase');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    await db.collection('test').add({ createdAt: new Date() });
    res.json({ message: 'Connexion Firestore OK' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));