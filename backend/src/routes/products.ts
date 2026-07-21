import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

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