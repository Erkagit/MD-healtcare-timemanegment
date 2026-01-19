// ==========================================
// AUTH MIDDLEWARE
// ==========================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone?: string;
        email?: string;
        type: 'patient' | 'admin';
      };
    }
  }
}

// Patient Auth Middleware
export const authenticatePatient = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Нэвтрэх шаардлагатай', 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      phone: string;
    };

    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      type: 'patient',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Хүчингүй токен', 401));
    }
    next(error);
  }
};

// Admin Auth Middleware
export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Админ нэвтрэх шаардлагатай', 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET!) as {
      id: string;
      email: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      type: 'admin',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Хүчингүй админ токен', 401));
    }
    next(error);
  }
};

// Optional Auth (doesn't fail if no token)
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Try patient token first
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          id: string;
          phone: string;
        };
        req.user = { id: decoded.id, phone: decoded.phone, type: 'patient' };
      } catch {
        // Try admin token
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET!) as {
          id: string;
          email: string;
        };
        req.user = { id: decoded.id, email: decoded.email, type: 'admin' };
      }
    }

    next();
  } catch {
    // No valid token, continue without auth
    next();
  }
};
