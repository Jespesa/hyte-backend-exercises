import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authenticateToken = (req, res, next) => {
  console.log('authenticateToken', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('token', token);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('User authenticated:', req.user.username);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export { authenticateToken };