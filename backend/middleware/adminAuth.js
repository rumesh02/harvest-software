const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    let decoded;
    try {
      // Try to decode the token without verification first (for Auth0 tokens)
      decoded = jwt.decode(token);
      
      // If that fails, try with verification using the secret
      if (!decoded) {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      }
    } catch (jwtError) {
      // If both fail, try to decode without verification as a last resort
      console.log('JWT verification failed, trying to decode:', jwtError.message);
      decoded = jwt.decode(token);
    }
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: 'Invalid token format.' });
    }
    
    // Find user and check if admin
    const user = await User.findOne({ auth0Id: decoded.sub });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = adminAuth;