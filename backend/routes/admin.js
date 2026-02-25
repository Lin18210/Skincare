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
// Computed directly from orders — no DB views needed
router.get('/revenue', async (req, res) => {
  const { period = 'month' } = req.query;
  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Group by month or day in JS
  const grouped = {};
  for (const order of data || []) {
    const d = new Date(order.created_at);
    const key = period === 'month'
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    grouped[key] = (grouped[key] || 0) + parseFloat(order.total || 0);
  }

  const result = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, rev]) => ({
      [period === 'month' ? 'month' : 'day']: key,
      revenue: rev.toFixed(2),
    }));

  return res.json(result);
});

// GET /api/admin/stats  (dashboard summary)
router.get('/stats', async (req, res) => {
  const [ordersRes, usersRes, revenueRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact' }).neq('status', 'cancelled'),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
    supabase.from('orders').select('total').neq('status', 'cancelled'),
  ]);

  if (revenueRes.error) console.error('Revenue stats error:', revenueRes.error.message);
  if (ordersRes.error) console.error('Orders stats error:', ordersRes.error.message);
  if (usersRes.error) console.error('Users stats error:', usersRes.error.message);

  const totalRevenue = (revenueRes.data || []).reduce(
    (s, o) => s + parseFloat(o.total || 0), 0
  );

  return res.json({
    totalOrders: ordersRes.count || 0,
    totalUsers: usersRes.count || 0,
    totalRevenue: totalRevenue.toFixed(2),
  });
});

// GET /api/admin/product-stats
// Top products by units sold + order status breakdown
router.get('/product-stats', async (req, res) => {
  const [itemsRes, ordersRes] = await Promise.all([
    supabase
      .from('order_items')
      .select('product_id, quantity, price, products(name)'),
    supabase
      .from('orders')
      .select('status'),
  ]);

  if (itemsRes.error) return res.status(500).json({ error: itemsRes.error.message });

  // Aggregate by product
  const productMap = {};
  for (const item of itemsRes.data || []) {
    const name = item.products?.name || 'Unknown';
    if (!productMap[name]) productMap[name] = { units: 0, revenue: 0 };
    productMap[name].units += item.quantity || 0;
    productMap[name].revenue += (item.quantity || 0) * parseFloat(item.price || 0);
  }

  const topProducts = Object.entries(productMap)
    .sort(([, a], [, b]) => b.units - a.units)
    .slice(0, 6)
    .map(([name, data]) => ({ name: name.length > 14 ? name.slice(0, 14) + '…' : name, ...data }));

  // Order status counts
  const statusCounts = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  for (const o of ordersRes.data || []) {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
  }

  return res.json({ topProducts, statusCounts });
});


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
