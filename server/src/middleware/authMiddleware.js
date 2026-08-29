const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Expect header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // grab the part after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaches { id, role } to the request for later use
    next(); // token valid — let the request continue to the actual route
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Restricts a route to specific roles — used AFTER authenticate
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { authenticate, authorize };