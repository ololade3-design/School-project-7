const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: 'Authentication is not configured.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !mongoose.isValidObjectId(decoded.userId)) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
    const user = await User.findById(decoded.userId).select('_id email role isActive');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Authentication is no longer valid.' });
    }

    req.user = { userId: String(user._id), email: user.email, role: user.role };
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to authenticate request.' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  const hasRequiredRole = req.user && (
    roles.includes(req.user.role) ||
    (req.user.role === 'super_admin' && roles.includes('admin'))
  );
  if (!hasRequiredRole) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
  }
  return next();
};

module.exports = { authenticateToken, authorizeRoles };
