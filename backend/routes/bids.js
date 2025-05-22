const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/', async (req, res) => {
  const { itemId, bidder, amount } = req.body;
  const io = req.app.get('io');  // get socket.io instance from express app

  try {
    // Step 1: Get item
    const itemRes = await db.query(
      'SELECT starting_price, reserve_price, ended FROM items WHERE id = $1',
      [itemId]
    );

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemRes.rows[0];
    if (item.ended) {
      return res.status(400).json({ error: 'Auction already ended.' });
    }

    // Step 2: Get current highest bid
    const bidRes = await db.query(
      'SELECT MAX(amount) AS highest_bid FROM bids WHERE item_id = $1',
      [itemId]
    );

    const highestBid = bidRes.rows[0].highest_bid
      ? parseFloat(bidRes.rows[0].highest_bid)
      : parseFloat(item.starting_price);

    // Step 3: Check if bid is valid
    if (parseFloat(amount) <= highestBid) {
      return res.status(400).json({
        error: `Bid must be higher than current highest bid of ₵${highestBid.toFixed(2)}.`,
      });
    }

    // Step 4: Insert bid
    await db.query(
      'INSERT INTO bids (item_id, bidder, amount) VALUES ($1, $2, $3)',
      [itemId, bidder, amount]
    );

    // Step 5: If bid meets/exceeds reserve, end auction & emit socket event
    if (parseFloat(amount) >= item.reserve_price) {
      await db.query(
        'UPDATE items SET ended = TRUE WHERE id = $1',
        [itemId]
      );

      // Emit auctionEnded event to all clients
      io.emit('auctionEnded', { itemId });
    }

    res.status(201).json({ message: 'Bid placed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while placing bid' });
  }
});

module.exports = router;
