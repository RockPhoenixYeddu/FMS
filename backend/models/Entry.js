const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  username: { type: String, required: true },
  usermail: { type: String, required: true }
});

module.exports = mongoose.model('Entry', entrySchema);
