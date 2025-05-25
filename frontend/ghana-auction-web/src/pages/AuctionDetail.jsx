import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001');

export default function AuctionDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const [error, setError] = useState('');

  // Fetch item by ID
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/items/${id}`);
        setItem(res.data);
      } catch (err) {
        setError('Failed to load auction item.');
        console.error(err);
      }
    };
    fetchItem();
  }, [id]);

  // Fetch existing bids
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/bids/${id}`);
        setBids(res.data);
      } catch (err) {
        console.error('Failed to load bids:', err);
      }
    };
    fetchBids();
  }, [id]);

  // Realtime updates
  useEffect(() => {
    socket.on('newBid', (data) => {
      if (data.itemId.toString() === id) {
        setBids(prev => [...prev, data]);
      }
    });
    return () => socket.off('newBid');
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!item) return;
    const interval = setInterval(() => {
      const diff = new Date(item.ends_at) - new Date();
      setRemainingTime(Math.max(0, Math.floor(diff / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [item]);

  const currentHighestBid = bids.length > 0
    ? Math.max(...bids.map(b => b.amount))
    : 0;

  const placeBid = async () => {
    const bidAmount = parseFloat(amount);
    if (!bidAmount || isNaN(bidAmount)) return alert("Enter a valid amount");

    if (bidAmount <= currentHighestBid) {
      return alert(`Your bid must be higher than the current highest bid (₵${currentHighestBid})`);
    }

    try {
      const bid = {
        itemId: id,
        bidder: 'You', // replace with actual user info if needed
        amount: bidAmount,
      };
      await axios.post('http://localhost:5001/api/bids', bid);
      socket.emit('placeBid', bid);
      setAmount('');
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('Failed to place bid. The auction may be closed or your bid was invalid.');
    }
  };

  if (error) return <div>{error}</div>;
  if (!item) return <div>Loading...</div>;

  const isEnded = item.ended;

  return (
    <div>
      <h2>{item.title}</h2>
      <p>{item.description}</p>

      <p><strong>Current Highest Bid:</strong> ₵{currentHighestBid.toFixed(2)}</p>
      <p><strong>Status:</strong> {isEnded ? 'Auction Ended' : 'Ongoing'}</p>
      <p><strong>Time Remaining:</strong> {remainingTime}s</p>

      {!isEnded && (
        <div style={{ marginTop: '1rem' }}>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter bid in cedis"
            type="number"
            min={currentHighestBid + 1}
          />
          <button onClick={placeBid}>Place Bid</button>
        </div>
      )}

      {isEnded && (
        <p style={{ color: 'green', marginTop: '1rem' }}>
          This auction has ended. No further bids allowed.
        </p>
      )}

      <h3>Bids</h3>
      <ul>
        {bids.map((bid, index) => (
          <li key={index}>{bid.bidder}: ₵{Number(bid.amount).toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}
