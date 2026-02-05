import { verifyToken } from '../services/auth.js';
import logger from '../services/logger.js';

export const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header', { ip: req.ip });
      return res.status(401).json({ 
        error: 'Invalid or expired token', 
        code: 'INVALID_TOKEN' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      logger.warn('Invalid JWT token', { ip: req.ip });
      return res.status(401).json({ 
        error: 'Invalid or expired token', 
        code: 'INVALID_TOKEN' 
      });
    }
    
    req.admin = decoded;
    next();
    
  } catch (error) {
    logger.error('JWT verification error', { error: error.message });
    res.status(401).json({ 
      error: 'Invalid or expired token', 
      code: 'INVALID_TOKEN' 
    });
  }
};
