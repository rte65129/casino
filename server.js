const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const { parse } = require('cookie');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Аутентификация для Socket.IO
  io.use((socket, next) => {
    const rawCookie = socket.handshake.headers.cookie || '';
    const cookies = parse(rawCookie);
    const token = cookies.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });

  global.io = io;

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});