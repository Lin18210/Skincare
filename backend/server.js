require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const quizRoutes = require('./routes/quiz');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

/* ================================
   CORS — works for web, native, local, and production
   JWT is sent in Authorization header (not cookies) so
   credentials mode is not required — origin: '*' is safe.
   ================================ */

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Preflight must be handled BEFORE any route
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));


app.use(express.json());

/* ================================
   STATIC FILES
   ================================ */
const path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')));

/* ================================
   ROOT & HEALTH CHECK
   ================================ */

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'CutieSkin API 🌸',
    status: 'running',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/products',
      '/api/categories',
      '/api/quiz',
      '/api/cart',
      '/api/orders',
      '/api/admin'
    ],
  });
});

// Health check (Render uses this)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ================================
   ROUTES
   ================================ */

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

/* ================================
   GLOBAL ERROR HANDLER
   ================================ */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

/* ================================
   START SERVER
   ================================ */

app.listen(PORT, () => {
  console.log(`🚀 Skincare API running on port ${PORT}`);
});