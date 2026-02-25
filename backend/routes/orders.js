const express = require('express');
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders  (checkout)
router.post('/', authenticate, async (req, res) => {
  const {
    delivery_name, delivery_email, delivery_phone, delivery_address,
    payment_last4, payment_expiry,
    items, // [{ product_id, quantity, unit_price, product_name, product_image }]
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shipping_fee = 5.00;
  const total = subtotal + shipping_fee;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: req.user.id,
      delivery_name, delivery_email, delivery_phone, delivery_address,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping_fee,
      total: parseFloat(total.toFixed(2)),
      payment_last4,
      payment_expiry,
      status: 'paid',
    })
    .select()
    .single();

  if (orderError) return res.status(400).json({ error: orderError.message });

  // Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_image: item.product_image || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return res.status(400).json({ error: itemsError.message });

  // Clear user's cart
  await supabase.from('cart_items').delete().eq('user_id', req.user.id);

  return res.status(201).json({ ...order, items: orderItems });
});

// GET /api/orders  (user's order history)
router.get('/', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();
  if (error) return res.status(404).json({ error: 'Order not found' });
  return res.json(data);
});

module.exports = router;
