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

  // Fetch item details
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

  // Realtime bid updates + auction end listener
  useEffect(() => {
    const handleNewBid = (data) => {
      if (data.itemId.toString() === id) {
        setBids(prev => [...prev, data]);
      }
    };

    const handleAuctionEnded = (data) => {
      if (data.itemId.toString() === id) {
        setItem(prev => ({ ...prev, ended: true }));
      }
    };

    socket.on('newBid', handleNewBid);
    socket.on('auctionEnded', handleAuctionEnded);

    return () => {
      socket.off('newBid', handleNewBid);
      socket.off('auctionEnded', handleAuctionEnded);
    };
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

  // Calculate current highest bid
  const highestBid = bids.length > 0
    ? Math.max(...bids.map(b => b.amount))
    : parseFloat(item?.starting_price || 0);

  // reserveMet flag
  const reserveMet = item && highestBid >= item.reserve_price;

  // Place a bid
  const placeBid = async () => {
    if (!amount || isNaN(amount)) return alert("Enter a valid amount");
    if (reserveMet || item?.ended) return alert("Auction has ended. Reserve price was met.");
    if (parseFloat(amount) <= highestBid) return alert("Bid must be higher than current highest bid.");

    const bid = {
      itemId: id,
      bidder: 'You', // Replace with actual logged-in user info
      amount: parseFloat(amount),
    };

    try {
      await axios.post('http://localhost:5001/api/bids', bid);
      socket.emit('placeBid', bid);
      setAmount('');
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('Failed to place bid. Make sure you are logged in.');
    }
  };

  if (error) return <div>{error}</div>;
  if (!item) return <div>Loading...</div>;

  return (
    <div>
      <h2>{item.title}</h2>
      <p>{item.description}</p>
      <p><strong>Current Bid:</strong> ₵{highestBid.toFixed(2)}</p>

      <p>
        {item.ended ? (
          <span style={{ color: 'gray' }}>Auction has ended.</span>
        ) : reserveMet ? (
          <span style={{ color: 'green' }}>Reserve price met. Auction ended.</span>
        ) : (
          <span style={{ color: 'red' }}>Reserve price not met.</span>
        )}
      </p>

      <p><strong>Time Remaining:</strong> {remainingTime}s</p>

      <div style={{ marginTop: '1rem' }}>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter bid in cedis"
          type="number"
          min="0"
          disabled={reserveMet || item?.ended}
        />
        <button onClick={placeBid} disabled={reserveMet || item?.ended}>Place Bid</button>
      </div>

      <h3>Bids</h3>
      <ul>
        {bids.map((bid, index) => (
          <li key={index}>{bid.bidder}: ₵{Number(bid.amount).toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}
