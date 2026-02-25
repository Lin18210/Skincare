const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'email, password, and full_name are required' });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name },
    email_confirm: true,
  });

  if (error) return res.status(400).json({ error: error.message });

  // Profile is auto-created via trigger. Return token.
  const token = jwt.sign(
    { id: data.user.id, email: data.user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({ token, user: { id: data.user.id, email, full_name } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid email or password' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const token = jwt.sign(
    { id: data.user.id, email: data.user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ token, user: profile });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();
  if (error) return res.status(404).json({ error: 'Profile not found' });
  return res.json(profile);
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  const { full_name, phone } = req.body;
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, phone, updated_at: new Date().toISOString() })
    .eq('id', req.user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

module.exports = router;
