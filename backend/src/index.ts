import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import passport from './config/passport.config';
import walletRoutes from './routes/wallet.routes';
import paypalRoutes from './routes/paypal.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import blockchainRoutes from './routes/blockchain.routes';
import bankingRoutes from './routes/banking.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcw1';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('?? MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('?? MongoDB connection failed:', error.message);
    // Continue running even if MongoDB fails (will use in-memory storage for some features)
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/banking', bankingRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'TCW1 Payment API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      wallet: '/api/wallet',
      paypal: '/api/paypal',
      admin: '/api/admin',
      blockchain: '/api/blockchain',
      banking: '/api/banking',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Socket.IO for real-time messaging and video calling
const activeUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`?? User connected: ${socket.id}`);

  // User joins with their ID
  socket.on('join', (userId: string) => {
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`?? User ${userId} joined`);
    
    // Broadcast online users
    io.emit('users-online', Array.from(activeUsers.keys()));
  });

  // Send message
  socket.on('send-message', (data: { from: string; to: string; message: string; timestamp: string }) => {
    const recipientSocket = activeUsers.get(data.to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('receive-message', data);
    }
    // Echo back to sender
    socket.emit('message-sent', data);
  });

  // Video call signaling
  socket.on('call-user', (data: { to: string; from: string; signal: any }) => {
    const recipientSocket = activeUsers.get(data.to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('incoming-call', {
        from: data.from,
        signal: data.signal
      });
    }
  });

  socket.on('accept-call', (data: { to: string; signal: any }) => {
    const recipientSocket = activeUsers.get(data.to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('call-accepted', data.signal);
    }
  });

  socket.on('reject-call', (data: { to: string }) => {
    const recipientSocket = activeUsers.get(data.to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('call-rejected');
    }
  });

  socket.on('end-call', (data: { to: string }) => {
    const recipientSocket = activeUsers.get(data.to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('call-ended');
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    let disconnectedUser: string | undefined;
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUser = userId;
        activeUsers.delete(userId);
        break;
      }
    }
    console.log(`? User disconnected: ${socket.id}`);
    if (disconnectedUser) {
      io.emit('users-online', Array.from(activeUsers.keys()));
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`?? TCW1 Backend Server running on port ${PORT}`);
  console.log(`?? API available at http://localhost:${PORT}`);
  console.log(`?? Supported currencies: BTC, USDT, ETH, PayPal`);
  console.log(`?? WebSocket server ready for messaging & video calls`);
  console.log(`?? Authentication available at /api/auth`);
});

export default app;
