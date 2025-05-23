const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/', async (req, res) => {
  const { itemId, bidder, amount } = req.body;
  const io = req.app.get('io');  // Get socket.io instance

  try {
    // Fetch item details
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

    // Get current highest bid or starting price if none
    const bidRes = await db.query(
      'SELECT MAX(amount) AS highest_bid FROM bids WHERE item_id = $1',
      [itemId]
    );

    const highestBid = bidRes.rows[0].highest_bid
      ? parseFloat(bidRes.rows[0].highest_bid)
      : parseFloat(item.starting_price);

    if (parseFloat(amount) <= highestBid) {
      return res.status(400).json({
        error: `Bid must be higher than current highest bid of ₵${highestBid.toFixed(2)}.`,
      });
    }

    // Insert new bid
    await db.query(
      'INSERT INTO bids (item_id, bidder, amount) VALUES ($1, $2, $3)',
      [itemId, bidder, amount]
    );

    // If bid meets/exceeds reserve price, end auction and notify clients
    if (parseFloat(amount) >= item.reserve_price) {
      await db.query('UPDATE items SET ended = TRUE WHERE id = $1', [itemId]);
      io.emit('auctionEnded', { itemId });
    }

    // Notify clients of the new bid
    io.emit('newBid', { itemId, bidder, amount: parseFloat(amount) });

    res.status(201).json({ message: 'Bid placed successfully' });
  } catch (err) {
    console.error('Error placing bid:', err);
    res.status(500).json({ error: 'Server error while placing bid' });
  }
});

module.exports = router;
