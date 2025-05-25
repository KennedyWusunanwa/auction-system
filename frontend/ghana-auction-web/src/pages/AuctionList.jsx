import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AuctionList() {
  const [items, setItems] = useState([]);

 useEffect(() => {
  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/items');
      console.log('Fetched items:', res.data); // 🔍 Debug log
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };
  fetchItems();
}, []);


  // Create formatter for Ghanaian Cedi currency
  const formatter = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  });

  return (
    <div>
      <h2>Active Auctions</h2>
     <ul>
  {items.map(item => (
    <li key={item.id}>
      <Link to={`/auction/${item.id}`}>
        {item.title} - {formatter.format(item.starting_price)}
      </Link>
    </li>
  ))}
</ul>


    </div>
  );
}
