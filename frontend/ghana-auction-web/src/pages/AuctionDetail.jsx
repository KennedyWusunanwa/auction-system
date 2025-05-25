import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';

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
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setError('Failed to load auction item.');
        console.error(error);
      } else {
        setItem(data);
      }
    };
    fetchItem();
  }, [id]);

  // Fetch bids for this item
  useEffect(() => {
    const fetchBids = async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('item_id', id)
        .order('amount', { ascending: false });
      if (error) {
        console.error('Failed to load bids:', error);
      } else {
        setBids(data);
      }
    };
    fetchBids();
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
    if (!bidAmount || isNaN(bidAmount)) {
      alert("Enter a valid amount");
      return;
    }

    if (bidAmount <= currentHighestBid) {
      alert(`Your bid must be higher than the current highest bid (₵${currentHighestBid})`);
      return;
    }

    try {
      const { error } = await supabase
        .from('bids')
        .insert([
          { item_id: id, bidder: 'You', amount: bidAmount }
        ]);
      if (error) {
        alert('Failed to place bid: ' + error.message);
      } else {
        setAmount('');
        // Refresh bids after successful bid
        const { data: updatedBids, error: bidsError } = await supabase
          .from('bids')
          .select('*')
          .eq('item_id', id)
          .order('amount', { ascending: false });
        if (!bidsError) setBids(updatedBids);
      }
    } catch (err) {
      alert('Failed to place bid: ' + err.message);
      console.error(err);
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
