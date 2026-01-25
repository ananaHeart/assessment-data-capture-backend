const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to protect routes by verifying JWT
const protect = async (req, res, next) => {
  let token;

  // Check for token in the authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database using the ID from the token
      // and attach it to the request object for future use
      const [users] = await db.query('SELECT user_id, role, status FROM user WHERE user_id = ?', [decoded.id]);
      
      if (users.length === 0 || users[0].status !== 'active') {
        return res.status(401).json({ message: 'Not authorized, user not found or inactive.' });
      }
      
      req.user = users[0];
      next(); // Proceed to the next middleware or controller
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

// Middleware to restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
