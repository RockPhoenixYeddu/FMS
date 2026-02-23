const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for frontend access

// Connect to MongoDB
require('./connection');

// Serve uploaded proofs statically
app.use('/uploads', express.static('uploads'));

// Routes
const entriesRoute = require('./routes/entries'); // Legacy if you want to keep
app.use('/api/entries', entriesRoute);

const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

const transactionsRoute = require('./routes/transactions');
app.use('/api/transactions', transactionsRoute);

// Test route
app.get('/', (req, res) => {
  res.send("Backend running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
