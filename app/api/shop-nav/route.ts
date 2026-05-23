import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ecom_collections')
      .select('id,title,handle')
      .eq('is_visible', true)
      .order('title', { ascending: true });

    if (error) {
      console.error('shop-nav error', error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}
