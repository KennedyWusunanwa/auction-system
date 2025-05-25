const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/', async (req, res) => {
  const { itemId, bidder, amount } = req.body;
  try {
    // Fetch the item with reserve price and ended status
    const itemResult = await db.query(
      'SELECT reserve_price, ended FROM items WHERE id = $1',
      [itemId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemResult.rows[0];

    if (item.ended) {
      return res.status(400).json({ error: 'Auction already ended' });
    }

    // Get current highest bid for item
    const bidResult = await db.query(
      'SELECT MAX(amount) AS max_bid FROM bids WHERE item_id = $1',
      [itemId]
    );
    const currentHighestBid = parseFloat(bidResult.rows[0].max_bid) || 0;

    if (amount <= currentHighestBid) {
      return res.status(400).json({ error: 'Bid must be higher than current highest bid' });
    }

    // Place new bid
    await db.query(
      'INSERT INTO bids (item_id, bidder, amount) VALUES ($1, $2, $3)',
      [itemId, bidder, amount]
    );

    // If bid meets or exceeds reserve price, end the auction
    if (amount >= parseFloat(item.reserve_price)) {
      await db.query(
        'UPDATE items SET ended = true WHERE id = $1',
        [itemId]
      );
    }

    res.status(201).json({ message: 'Bid placed successfully' });
  } catch (err) {
    console.error('Error placing bid:', err);
    res.status(500).json({ error: err.message });
  }
});


// Get all bids for an item by itemId
router.get('/:itemId', async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM bids WHERE item_id = $1 ORDER BY amount DESC',
      [itemId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
