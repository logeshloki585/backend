const express = require('express');
const { join } = require('node:path');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer, {
  cors: {
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.static(join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('offer', (data) => {
      console.log('Offer received:', data);
      io.to(data.roomId).emit('offer', { sdp: data.sdp, from: socket.id });
  });

  // socket.on("message", (message) => {
  //   console.log(message)
  //   socket.broadcast.emit("message", message);
  // });

  socket.on("message", (message, roomId) => {
    console.log(`Message for room ${roomId}:`, message);
    socket.to(roomId).emit("message", message);
  });

  socket.on('answer', (data) => {
      console.log('Answer received:', data);
      io.to(data.roomId).emit('answer', { sdp: data.sdp, from: socket.id });
  });

  socket.on('candidate', (data) => {
      console.log('ICE candidate received:', data);
      io.to(data.roomId).emit('candidate', { candidate: data.candidate, from: socket.id });
  });

  socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

{/* <script src="https://cdn.socket.io/4.7.5/socket.io.min.js" integrity="sha384-2huaZvOR9iDzHqslqwpR87isEmrfxqyWOF7hr7BY6KG0+hVKLoEXMPUJw3ynWuhO" crossorigin="anonymous"></script> */}
