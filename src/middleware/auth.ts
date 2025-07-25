import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import User from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        jti?: string | undefined;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token required'
        }
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token
    const decoded = await verifyAccessToken(token);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User no longer exists'
        }
      });
      return;
    }

    // Attach user to request object
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      jti: decoded.jti || undefined
    };

    next();
  } catch (error: any) {
    const errorMessage = error.message || 'Invalid or expired access token';
    res.status(401).json({
      success: false,
      error: {
        message: errorMessage
      }
    });
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = await verifyAccessToken(token);
    
    const user = await User.findById(decoded.userId);
    if (user) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        jti: decoded.jti || undefined
      };
    }

    next();
  } catch (error) {
    // Token is invalid, but we continue without authentication
    next();
  }
}; 