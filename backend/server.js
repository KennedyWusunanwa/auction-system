// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/items', require('./routes/items'));
app.use('/api/bids', require('./routes/bids'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Broadcast new bids to all connected clients
  socket.on('placeBid', (data) => {
    io.emit('newBid', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
