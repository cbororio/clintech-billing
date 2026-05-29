require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/payment', require('./routes/payment'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Clintech Co Billing System' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     CLINTECH CO BILLING SYSTEM        ║
  ║     Server running on port ${PORT}        ║
  ║     http://localhost:${PORT}              ║
  ╚═══════════════════════════════════════╝
  `);
});
