const mongoose = require('mongoose');
require('dotenv').config();

console.log("Starting DB test with URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB successfully!");
        process.exit(0);
    })
    .catch(err => {
        console.error("FAILURE: Could not connect to MongoDB.");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        process.exit(1);
    });

// Force exit after 15 seconds if still hanging
setTimeout(() => {
    console.error("FAILURE: Connection timed out after 15 seconds.");
    process.exit(1);
}, 15000);
