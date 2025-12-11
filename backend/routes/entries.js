const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry'); // Make sure path is correct

// GET all entries
router.get('/', async (req, res) => {
  const entries = await Entry.find();
  res.json(entries);
});

// POST new entry
router.post('/', async (req, res) => {
  const { username, usermail } = req.body;
  const entry = new Entry({ username, usermail });
  await entry.save();
  res.json(entry);
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Entry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;

