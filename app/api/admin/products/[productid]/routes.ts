/*
 * File: app/api/admin/products/[productid]/routes.ts
 * Responsible for handling product-related operations for a specific product ID in the admin context.
 * This includes updating and deleting products.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productService } from '@/lib/services/productService';
import { verifyAuth } from '@/lib/auth/middleware';

interface RouteParams 
{
  params: {
    productid: string;
  };
}

/**
 * PUT /api/admin/products/[productid]
 * Update an existing product
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await verifyAuth(request);                                                                                     //- Verify user is authenticated
    if (!userId) 
    {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productid } = params;

    console.log(`📦 Updating product: ${productid}`);

    if (!productid) 
    {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();                                                                                            //- Parse the request body as JSON

    /* 
     * Validate that at least one of the updatable fields is present in the request body.
     * This prevents empty updates and ensures that the request contains meaningful data.
     */
    const updateFields = [
      'name',
      'handle',
      'sku',
      'price',
      'description',
      'producttypeid',
      'model',
      'medical_information',
      'status',
    ];
    const hasValidFields = updateFields.some((field) => field in body);                                                           //- Check if at least one valid field is present in the request body

    if (!hasValidFields)                                                                                                          //- If no valid fields are present, return a 400 response
    {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const result = await productService.updateProduct(
                                                        supabaseAdmin,
                                                        userId,
                                                        productid,
                                                        body
    );                                                                                                                            //- Call the product service to update the product with the provided data

    if (!result.success) 
    {
      console.error('❌ Service error:', result.error);
      if (typeof result.error === 'string' && result.error.includes('Unauthorized')) 
      {
        return NextResponse.json(
          { error: result.error },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log(`✅ Updated product: ${productid}`);
    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[productid]
 * Delete a product
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify user is authenticated
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productid } = params;

    console.log(`📦 Deleting product: ${productid}`);

    if (!productid) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const result = await productService.deleteProduct(
      supabaseAdmin,
      userId,
      productid
    );

    if (!result.success) {
      console.error('❌ Service error:', result.error);
      if (typeof result.error === 'string' && result.error.includes('Unauthorized')) {
        return NextResponse.json(
          { error: result.error },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    console.log(`✅ Deleted product: ${productid}`);
    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}