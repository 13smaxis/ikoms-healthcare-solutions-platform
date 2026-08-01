/*
 * Auth Middleware for Next.js API routes with Supabase JWT verification.
 */
import { NextRequest } from 'next/server';
import { jwtVerify, importJWK } from 'jose';

let cachedPublicKey: any = null;

async function getSupabasePublicKey() {
  if (cachedPublicKey !== null) return cachedPublicKey;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const jwksUrl = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
    
    console.log(`📍 Fetching JWKS from: ${jwksUrl}`);
    
    const response = await fetch(jwksUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ JWKS fetch failed: ${response.status}`, errorText);
      throw new Error(`JWKS fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Got JWKS response`);
    
    if (!data.keys || data.keys.length === 0) {
      throw new Error('No keys found in JWKS response');
    }

    const jwk = data.keys[0];
    console.log(`🔑 Extracted JWK, converting to key...`);
    
    // ✅ Use importJWK instead of manual conversion
    cachedPublicKey = await importJWK(jwk, 'ES256');
    
    console.log(`✅ Successfully cached public key`);
    return cachedPublicKey;
  } catch (error) {
    console.error('❌ Failed to fetch Supabase public key:', error);
    throw new Error('Could not retrieve JWT verification key');
  }
}

export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('⚠️ No authorization header');
      return null;
    }

    const token = authHeader.slice(7);
    console.log(`🔐 Verifying token...`);
    
    const publicKey = await getSupabasePublicKey();
    const verified = await jwtVerify(token, publicKey);
    
    if (!verified?.payload?.sub) {
      console.warn('⚠️ Invalid token - no sub claim');
      return null;
    }

    console.log(`✅ Token verified for user: ${verified.payload.sub}`);
    return verified.payload.sub as string;
  } catch (error) {
    console.error('❌ Auth verification error:', error);
    return null;
  }
}