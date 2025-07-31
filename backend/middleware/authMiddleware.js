const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Middleware: Protect routes (require valid JWT)
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Load user and populate linked employee
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('employee');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 🔐 Extra check: employee must have linked profile
    if (user.role === 'employee') {
      if (!user.employee || !user.employee._id) {
        return res.status(400).json({ message: 'Linked employee profile missing or invalid' });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ JWT error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Middleware: Admin-only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access only' });
};

module.exports = { protect, adminOnly };
