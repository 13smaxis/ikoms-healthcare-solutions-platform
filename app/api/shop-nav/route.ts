import { NextResponse } from 'next/server';
import { SHOP_CATEGORIES } from '@/lib/categories';

export async function GET() {
  return NextResponse.json(SHOP_CATEGORIES);
}
