
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { productService } from '../services/product.js';
import {
  authMiddleware,
  requireManager,
  verifyStoreOwnership,
  AuthenticatedRequest,
} from '../middleware/auth.js';

export const productRouter = Router();

console.log('📦 Products router initialized');

/**
 * GET /api/products/public/store/:storeid
 * Fetch all published products for a store (PUBLIC - no auth required)
 */
productRouter.get('/public/store/:storeid', async (req: Request, res: Response) => {
  try {
    const { storeid } = req.params;
    
    console.log(`📦 Fetching products for store: ${storeid}`);

    if (!storeid) {
      console.warn('⚠️ No store ID provided');
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
                productid,
                storeid,
                name,
                handle,
                sku,
                price,
                description,
                model,
                medical_information,
                status,
                createdat,
                updatedat,
                product_types (
                                type
                ),
                product_images (
                                imageid,
                                imageurl,
                                alttext,
                                displayorder
                ),
                product_features (
                                  featureid,
                                  featuretext
          )
      `)
      .eq('storeid', storeid)
      .eq('status', 'published')
      .order('createdat', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    console.log(`✅ Found ${data?.length || 0} published products`);
    
    return res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('❌ Route error:', error);
    return res.status(500).json({
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/products/detail/:productid
 * Fetch a single product (PUBLIC)
 */
productRouter.get('/detail/:productid', async (req: Request, res: Response) => {
  try {
    const { productid } = req.params;

    console.log(`📦 Fetching product: ${productid}`);

    if (!productid) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
                productid,
                storeid,
                name,
                handle,
                sku,
                price,
                description,
                model,
                medical_information,
                status,
                createdat,
                updatedat,
                product_types (
                                type
                ),
                product_images (
                                imageid,
                                imageurl,
                                alttext,
                                displayorder
                ),
                product_features (
                                    featureid,
                                    featuretext
                )
            `)  
      .eq('productid', productid)
      .single();

    if (error) {
      console.warn('⚠️ Product not found:', productid);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`✅ Found product: ${data?.name}`);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Route error:', error);
    return res.status(500).json({
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
productRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { storeid, name, handle, sku, price, ...rest } = req.body;

    // Validate required fields
    if (!name || !handle || !sku || price === undefined || price === null) {
      return res.status(400).json({
        error: 'Missing required fields: name, handle, sku, price',
      });
    }

    // Validate types
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Invalid product name' });
    }
    if (typeof handle !== 'string' || handle.trim() === '') {
      return res.status(400).json({ error: 'Invalid product handle' });
    }
    if (typeof sku !== 'string' || sku.trim() === '') {
      return res.status(400).json({ error: 'Invalid SKU' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const result = await productService.createProduct(
      supabaseAdmin,
      userId,
      storeid,
      {
        name: name.trim(),
        handle: handle.trim(),
        sku: sku.trim(),
        price,
        ...rest,
      }
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json({ success: true, data: result.data });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/products/:productid
 * Update a product
 */
productRouter.put('/:productid', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { productid } = req.params;
    const userId = (req as any).userId;

    const result = await productService.updateProduct(
      supabaseAdmin,
      userId,
      productid,
      req.body
    );

    if (!result.success) 
    {
      const isUnauthorized = typeof result.error === 'string' && result.error.includes('Unauthorized');
      const status = isUnauthorized ? 403 : 400;
      return res.status(status).json({ error: result.error });
    }

    return res.json({ success: true, data: result.data });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});


/**
 * DELETE /api/products/:productid
 * Delete a product
 */
productRouter.delete('/:productid', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { productid } = req.params;
    const userId = (req as any).userId;

    const result = await productService.deleteProduct(
      supabaseAdmin,
      userId,
      productid
    );

    if (!result.success) 
    {
      const status = String(result.error ?? '').includes('Unauthorized') ? 403 : 404;
      return res.status(status).json({ error: result.error });
    }

    return res.json({ success: true, data: result.data });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});