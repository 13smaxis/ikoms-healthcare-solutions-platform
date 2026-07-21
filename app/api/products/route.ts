import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';

/**
 * GET /api/products?storeid=xxx
 * Get published products for a store (PUBLIC - no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeid = searchParams.get('storeid');
    const productid = searchParams.get('productid');

    // Single product
    if (productid) {
      const result = await productService.getProduct(productid);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: result.data });
    }

    // Published products for store
    if (!storeid) {
      return NextResponse.json(
        { error: 'Store ID or product ID is required' },
        { status: 400 }
      );
    }

    const result = await productService.getPublishedProductsByStore(storeid);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data || [] });
  } catch (error) {
    console.error('❌ Route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}