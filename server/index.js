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

  // Relay typing status
  socket.on('typing', ({ to, room }) => {
    const user = users.get(socket.id);
    if (!user) return;

    if (room) {
      socket.to(room).emit('typing', { from: socket.id, username: user.username });
    } else if (to) {
      io.to(to).emit('typing', { from: socket.id, username: user.username });
    }
  });

  // WebRTC Signaling
  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    // We need to find the socket ID for the target userToCall (which is likely a userId or username)
    // However, the client sends 'userToCall' which might be an ID. 
    // Let's assume userToCall IS the socket ID for simplicity, OR we look it up.
    // In our app, 'users' map keys ARE socket IDs.

    // Check if target exists
    if (users.has(userToCall)) {
      io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    } else {
      // Optional: emit 'callFailed'
    }
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", candidate);
  });

  socket.on("endCall", ({ to }) => {
    io.to(to).emit("endCall");
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
