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

// ── CORS: manual headers first (runs before everything, even errors) ──────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(200); // preflight done
  next();
});
// cors package as backup
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'], allowedHeaders: ['Content-Type','Authorization'] }));
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
