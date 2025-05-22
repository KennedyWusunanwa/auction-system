console.log('Items route loaded');
const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/', async (req, res) => {
  const { title, description, startingPrice, endsAt } = req.body;
  try {
    await db.query(
      'INSERT INTO items (title, description, starting_price, ends_at) VALUES ($1, $2, $3, $4)',
      [title, description, startingPrice, endsAt]
    );
    res.status(201).json({ message: 'Item created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this GET / route to get all items
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use((req, res, next) => {
  console.log(`Items route called: ${req.method} ${req.originalUrl}`);
  next();
});


module.exports = router;
