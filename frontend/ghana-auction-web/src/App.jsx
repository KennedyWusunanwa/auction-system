import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PostItem from './pages/PostItem';
import AuctionList from './pages/AuctionList';
import AuctionDetail from './pages/AuctionDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuctionList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post-item" element={<PostItem />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
