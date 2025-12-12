const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for frontend access

// Connect to MongoDB
require('./connection');  // Make sure connection.js handles mongoose.connect()

// Routes
const entriesRoute = require('./routes/entries');
app.use('/api/entries', entriesRoute);

// Test route
app.get('/', (req, res) => {
  res.send("Backend running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
