import { Request, Response, NextFunction } from 'express';
import { createAuthenticatedClient } from '../config/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userid: string;
    email: string;
    role: string;
    storeid?: string;
  };
  supabaseClient?: ReturnType<typeof createAuthenticatedClient>;
  token?: string;
}

const decodeJwtPayload = (token: string): any => {
  const [, payload] = token.split('.');
  if (!payload) return null;
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  try {
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

/**
 * Verify JWT token and extract user context
 * Attaches user info and authenticated Supabase client to request
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract token from Authorization header
    const authHeader = req.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7); // Remove 'Bearer '

    const decoded: any = decodeJwtPayload(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token claims' });
    }

    // Extract user info from JWT claims
    const userid = decoded.sub; // Supabase uses 'sub' for user ID
    const email = decoded.email;

    if (!userid || !email) {
      return res.status(401).json({ error: 'Invalid token claims' });
    }

    // Fetch user role from database
    const { data: userData, error: userError } = await createAuthenticatedClient(token)
      .from('users')
      .select('userid, email, usertype')
      .eq('userid', userid)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Fetch user's role assignment
    const { data: assignmentData } = await createAuthenticatedClient(token)
      .from('staff_assignments')
      .select(`
        roleid,
        roles (
          rolename
        )
      `)
      .eq('userid', userid)
      .eq('status', 'active')
      .single();

    const roleRecord = Array.isArray(assignmentData?.roles)
      ? assignmentData.roles[0]
      : assignmentData?.roles;
    const userRole = roleRecord?.rolename || 'customer';

    // Fetch store ID if user is a manager
    let storeid: string | undefined;
    if (userRole.toLowerCase() === 'manager') {
      const { data: storeData } = await createAuthenticatedClient(token)
        .from('stores')
        .select('storeid')
        .eq('managerid', userid)
        .single();

      storeid = storeData?.storeid;
    }

    // Attach user context to request
    req.user = {
      userid,
      email,
      role: userRole.toLowerCase(),
      storeid,
    };

    // Attach authenticated Supabase client for operations
    req.supabaseClient = createAuthenticatedClient(token);
    req.token = token;

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Require manager role
 */
export function requireManager(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Manager access required' });
  }
  return next();
}

/**
 * Require admin role (manager, staff, supervisor)
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !['manager', 'staff', 'supervisor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

/**
 * Verify user owns the store they're trying to modify
 */
export function verifyStoreOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.storeid) {
    return res.status(403).json({ error: 'User is not associated with a store' });
  }

  // Store ID will be verified in route handlers
  return next();
}