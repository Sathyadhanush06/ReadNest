const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const pool = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Test database connection
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log(`Successfully connected to MySQL database. Connection test result: ${rows[0].solution}`);
  } catch (err) {
    console.error('Critical database connection error:', err.message);
    process.exit(1);
  }
})();

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ReadNest API server is running.' });
});

// Import routers
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const wishlistRouter = require('./routes/wishlist');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const reviewsRouter = require('./routes/reviews');
const marketplaceRouter = require('./routes/marketplace');
const recommendationsRouter = require('./routes/recommendations');

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/recommendations', recommendationsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error occurred' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
