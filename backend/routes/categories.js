const express = require('express');
const supabase = require('../lib/supabase');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

module.exports = router;
