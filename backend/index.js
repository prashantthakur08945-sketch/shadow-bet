const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const shadowRoutes = require('./src/routes/shadow');
const dareRoutes = require('./src/routes/dares');
const paymentRoutes = require('./src/routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shadow', shadowRoutes);
app.use('/api/dares', dareRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'live', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Shadow Bet Backend running on port ${PORT}`);
});
