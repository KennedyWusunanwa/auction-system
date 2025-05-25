import { useState } from 'react';
import axios from 'axios';

export default function PostItem() {
  const [form, setForm] = useState({ title: '', description: '', startingPrice: '', endsAt: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/items', form);
      alert('Item posted!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" onChange={handleChange} />
      <textarea name="description" placeholder="Description" onChange={handleChange} />
      <input name="startingPrice" placeholder="Starting Price" type="number" onChange={handleChange} />
      <input name="endsAt" placeholder="End Time (ISO format)" onChange={handleChange} />
      <button type="submit">Post Auction Item</button>
    </form>
  );
}