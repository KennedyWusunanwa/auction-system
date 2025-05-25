import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';

export default function AuctionList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      let { data, error } = await supabase
        .from('items')
        .select('*')
        .order('ends_at', { ascending: true });

      if (error) {
        console.error('Error fetching items:', error);
      } else {
        setItems(data);
      }
    };
    fetchItems();
  }, []);

  // Currency formatter
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
