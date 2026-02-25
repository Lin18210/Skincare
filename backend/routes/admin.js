const express = require('express');
const supabase = require('../lib/supabase');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles(full_name, email), order_items(*)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/admin/revenue
// ?period=day|month  (default: month)
router.get('/revenue', async (req, res) => {
  const { period = 'month' } = req.query;
  const view = period === 'day' ? 'revenue_by_day' : 'revenue_by_month';
  const { data, error } = await supabase.from(view).select('*').limit(12);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/admin/stats  (dashboard summary)
router.get('/stats', async (req, res) => {
  const [ordersRes, usersRes, revenueRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact' }).neq('status', 'cancelled'),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
    supabase.from('orders').select('total').neq('status', 'cancelled'),
  ]);
  const totalRevenue = (revenueRes.data || []).reduce((s, o) => s + parseFloat(o.total), 0);
  const todayOrders = (ordersRes.data || []).length; // simplified
  return res.json({
    totalOrders: ordersRes.count || 0,
    totalUsers: usersRes.count || 0,
    totalRevenue: totalRevenue.toFixed(2),
  });
});

// Product CRUD (mirrored for admin convenience)
router.get('/products', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/products', async (req, res) => {
  const { data, error } = await supabase.from('products').insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/products/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.delete('/products/:id', async (req, res) => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ success: true });
});

module.exports = router;
