const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();
    if (error || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user.role = 'admin';
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { authenticate, requireAdmin };
