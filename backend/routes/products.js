const express = require('express');
const supabase = require('../lib/supabase');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products  (optional ?category=Cleanser&skin_type=oily)
router.get('/', async (req, res) => {
  const { category, skin_type, concern, search } = req.query;

  let query = supabase
    .from('products')
    .select('*, categories(id, name, icon)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (category) {
    // Join on category name
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', category)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (skin_type) query = query.contains('skin_types', [skin_type]);
  if (concern) query = query.contains('skin_concerns', [concern]);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, icon)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Product not found' });
  return res.json(data);
});

// POST /api/products  (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('products').insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(data);
});

// PUT /api/products/:id  (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

// DELETE /api/products/:id  (admin - soft delete)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ success: true });
});

module.exports = router;
