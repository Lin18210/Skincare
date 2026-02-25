const express = require('express');
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*, categories(name, icon))')
    .eq('user_id', req.user.id)
    .order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// POST /api/cart  { product_id, quantity }
router.post('/', authenticate, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  const { data, error } = await supabase
    .from('cart_items')
    .upsert({ user_id: req.user.id, product_id, quantity }, { onConflict: 'user_id,product_id' })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(data);
});

// PUT /api/cart/:id  { quantity }
router.put('/:id', authenticate, async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Valid quantity required' });

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

// DELETE /api/cart/:id  (single item)
router.delete('/:id', authenticate, async (req, res) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ success: true });
});

// DELETE /api/cart  (clear all)
router.delete('/', authenticate, async (req, res) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ success: true });
});

module.exports = router;
