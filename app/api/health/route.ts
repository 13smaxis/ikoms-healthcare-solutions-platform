import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { status: 'error', message: 'Supabase client unavailable' },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin.from('products').select('productid').limit(1);

    if (error) {
      console.error('Health check failed:', error.message);
      return NextResponse.json(
        { status: 'error', message: 'Database unreachable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check crashed:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
