import { Request, Response, NextFunction } from 'express';
import { supabaseClient } from '../config/supabase';
import { AuthenticationError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    user_metadata?: Record<string, any>;
  };
  token?: string;
}

/**
 * Middleware to verify JWT token and attach user to request
 * Expects token in Authorization header: "Bearer <token>"
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    req.token = token;

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'customer',
      user_metadata: user.user_metadata,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
      });
    } else {
      res.status(401).json({
        error: 'Authentication failed',
        code: 'AUTH_ERROR',
      });
    }
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED',
      });
    }

    if (!allowedRoles.includes(req.user.role || 'customer')) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
}
