import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

// Store connected users 
// Map<socketId, { publicKey: string, username: string, room: string }>
const users = new Map();

io.on('connection', (socket) => {
  // User joins with a username, public key, and ROOM
  socket.on('join', ({ username, publicKey, room = 'global' }) => {
    // Join the socket.io room
    socket.join(room);

    users.set(socket.id, {
      id: socket.id,
      username,
      publicKey,
      room
    });

    console.log(`${username} joined room: ${room}`);

    // Get all users in this specific room
    const roomUsers = Array.from(users.values()).filter(u => u.room === room);

    // Broadcast list to ONLY this room
    io.to(room).emit('users:list', roomUsers);
  });

  // Relay a message
  // Metadata added for advanced features: { expiresAt: number, unlocksAt: number }
  socket.on('message:private', ({ to, content, iv, metadata }) => {
    io.to(to).emit('message:private', {
      from: socket.id,
      content, // Encrypted
      iv,
      metadata, // relay metadata openly so client knows when to show/hide
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    if (users.has(socket.id)) {
      const user = users.get(socket.id);
      console.log(`${user.username} disconnected from ${user.room}.`);
      users.delete(socket.id);

      // Update the room they left
      const roomUsers = Array.from(users.values()).filter(u => u.room === user.room);
      io.to(user.room).emit('users:list', roomUsers);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
