                      // app/api/admin/products/route.ts
// POST /api/admin/products - Create a new product
// GET /api/admin/products?storeid=xxx - Get all products for a store

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productService } from '@/lib/services/productService';
import { verifyAuth } from '@/lib/auth/middleware';

/**
 * POST /api/admin/products
 * Create a new product
 * Required: storeid, name, handle, sku, price
 */
export async function POST(request: NextRequest) 
{
  try {
   const userId = await verifyAuth(request);                                                                                     //- Verify user is authenticated
    if (!userId) 
    {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
//onst userId = '04974986-ed07-4254-ae8d-9a1e67a3a659'; 
                                                                                                //- For testing - use fake user ID
    const body = await request.json();
    const { storeid, name, handle, sku, price, images, ...rest } = body;

    console.log(`📦 Creating product in store: ${storeid}`);

    // Validate required fields
    if (!name || !handle || !sku || price === undefined || price === null) {
      console.warn('⚠️ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: name, handle, sku, price' },
        { status: 400 }
      );
    }

    // Validate field types
    if (typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid product name' },
        { status: 400 }
      );
    }

    if (typeof handle !== 'string' || handle.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid product handle' },
        { status: 400 }
      );
    }

    if (typeof sku !== 'string' || sku.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid SKU' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (!storeid || typeof storeid !== 'string') {
      return NextResponse.json(
        { error: 'Valid store ID is required' },
        { status: 400 }
      );
    }

    // Call service to create product
    const result = await productService.createProduct(
      supabaseAdmin,
      userId,
      storeid,
      {
        name: name.trim(),
        handle: handle.trim(),
        sku: sku.trim(),
        price,
        ...rest, // description, producttypeid, model, medical_information, status
      }
    );

    if (!result.success) {
      console.error('❌ Service error:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const product = result.data;
    let insertedImages = [];

    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`📷 Saving ${images.length} image(s) for product ${product.productid}`);
      const imageRecords = images.map((image: any, index: number) => ({
        productid: product.productid,
        imageurl: String(image.imageurl || image.publicUrl || ''),
        alttext: typeof image.alttext === 'string' ? image.alttext : null,
        displayorder: typeof image.displayorder === 'number' ? image.displayorder : index,
      })).filter((image) => image.imageurl);

      if (imageRecords.length > 0) {
        const { data: imageData, error: imageError } = await supabaseAdmin
          .from('product_images')
          .insert(imageRecords)
          .select();

        if (imageError) {
          console.error('❌ Failed saving product images:', imageError);
          return NextResponse.json(
            { error: imageError.message || 'Failed to save product images' },
            { status: 500 }
          );
        }

        insertedImages = imageData || [];
        console.log(`✅ Saved ${insertedImages.length} image row(s) for product ${product.productid}`);
      } else {
        console.log('⚠️ No valid image records found in payload');
      }
    }

    console.log(`✅ Created product: ${product.productid}`);
    return NextResponse.json(
      { success: true, data: { ...product, product_images: insertedImages } },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/products?storeid=xxx
 * Get all products for a store (with all statuses)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    //const userId = '04974986-ed07-4254-ae8d-9a1e67a3a659'; 

    const { searchParams } = new URL(request.url);
    const storeid = searchParams.get('storeid');

    console.log(`📦 Fetching all products for store: ${storeid}`);

    if (!storeid) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns the store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('managerid')
      .eq('storeid', storeid)
      .single();

    if (storeError || store?.managerid !== userId) {
      console.warn('⚠️ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const result = await productService.getProductsByStore(supabaseAdmin, storeid);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${result.data?.length || 0} products`);
    return NextResponse.json(
      { success: true, data: result.data || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}