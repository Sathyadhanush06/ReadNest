const jwt = require('jsonwebtoken');
require('dotenv').config();

// Standard auth middleware
const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token found in Authorization header' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretreadnestkey12345!');
    req.user = decoded; // Contains id, email, role
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Role-based auth generator
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  auth,
  checkRole
};
