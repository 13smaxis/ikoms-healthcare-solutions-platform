import { NextResponse } from 'next/server';
import { SHOP_CATEGORIES } from '@/lib/category-names';

export async function GET() {
  return NextResponse.json(SHOP_CATEGORIES);
}
