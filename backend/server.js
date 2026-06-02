import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';


const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow local dev origins (any port) and no-origin requests (Postman etc.)
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/categories', categoryRoutes);
// Gallery routes removed

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TrincoMate API is running.' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const PORT = process.env.PORT || 5000;

console.log('📋 Starting server initialization...');
console.log('📋 PORT:', PORT);
console.log('📋 NODE_ENV:', process.env.NODE_ENV);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📋 Server successfully bound to port');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

server.on('connection', (conn) => {
  console.log('📋 New connection established');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

console.log('📋 Server initialization complete');
