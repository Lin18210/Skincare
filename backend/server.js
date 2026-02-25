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

// CORS — allow Vercel frontend, localhost dev, and Expo Go
const allowedOrigins = [
  'https://skincare-ruddy-rho.vercel.app',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19006',
  'exp://',
];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    return callback(null, true); // allow all for now — tighten after testing
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
// Respond to all OPTIONS preflight requests
app.options('*', cors());
app.use(express.json());


// Root route
app.get('/', (req, res) => res.json({
  name: 'CutieSkin API 🌸',
  status: 'running',
  version: '1.0.0',
  endpoints: ['/api/auth', '/api/products', '/api/categories', '/api/quiz', '/api/cart', '/api/orders', '/api/admin'],
}));

// Health check (used by Render)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Skincare API running on http://localhost:${PORT}`);
});
