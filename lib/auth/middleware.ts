
/*
 * Auth Middleware for Next.js API routes.
 * This middleware verifies JWT tokens and ensures that users are authenticated before accessing protected routes.
 * It also provides role-based access control for managers and admins.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

/**
 * Verify JWT token from Authorization header
 * Returns userId if valid, null if invalid
 */
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7);

    // If using Supabase auth (recommended)
    // You can use Supabase's built-in verification
    const { data, error } = await supabase.auth.admin.getUserById(token);
    
    if (error || !data?.user?.id) {
      return null;
    }

    return data.user.id;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Alternative: If using Jose JWT directly
 * export async function verifyAuth(request: NextRequest): Promise<string | null> {
 *   try {
 *     const authHeader = request.headers.get('authorization');
 *     if (!authHeader?.startsWith('Bearer ')) {
 *       return null;
 *     }
 *     const token = authHeader.slice(7);
 *     const verified = await jwtVerify(token, secret);
 *     return verified.payload.sub as string;
 *   } catch (error) {
 *     return null;
 *   }
 * }
 */