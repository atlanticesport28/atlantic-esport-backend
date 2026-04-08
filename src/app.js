const express = require('express');
const cors = require('cors');

const app = express();

// 🔥 Middlewares
app.use(cors());
app.use(express.json());

// ✅ ROUTE PRINCIPALE (OBLIGATOIRE)
app.get('/', (req, res) => {
  res.send('ATLANTIC ESPORT API RUNNING 🚀');
});

// ✅ ROUTE TEST
app.get('/test', (req, res) => {
  res.json({ message: 'API working perfectly' });
});

module.exports = app;
