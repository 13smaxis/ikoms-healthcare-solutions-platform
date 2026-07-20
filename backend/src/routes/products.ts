import { Router, Response } from 'express';
import {
  authMiddleware,
  requireManager,
  verifyStoreOwnership,
  AuthenticatedRequest,
} from '../middleware/auth.js';
import { productService } from '../services/product.js';

const router = Router();

/**
 * POST /api/products
 * Create a new product
 * Requires: Manager role + store ownership
 */
router.post(
  '/',
  authMiddleware,
  requireManager,
  verifyStoreOwnership,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, handle, sku, price, description, producttypeid, model, medical_information, status } =
        req.body;

      // Validate required fields
      if (!name || !handle || !sku || price === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: name, handle, sku, price',
        });
      }

      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      if (!req.user?.userid || !req.user?.storeid || !req.supabaseClient) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const priceValue = typeof price === 'number' ? price : parseFloat(String(price));
      const result = await productService.createProduct(
        req.supabaseClient,
        req.user.userid,
        req.user.storeid,
        {
          name: name.trim(),
          handle: handle.trim().toLowerCase(),
          sku: sku.trim().toUpperCase(),
          price: priceValue,
          description: description?.trim(),
          product_type: producttypeid,
          model: model?.trim(),
          medical_information: medical_information?.trim(),
          status: status || 'draft',
        }
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        message: 'Product created successfully',
      });
    } catch (error) {
      console.error('POST /api/products error:', error);
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

/**
 * GET /api/products/:storeid
 * Get all products for a store
 * Requires: Authentication
 */
router.get(
  '/:storeid',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { storeid } = req.params;

      if (!storeid) {
        return res.status(400).json({ error: 'Store ID is required' });
      }

      if (!req.supabaseClient) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await productService.getProductsByStore(
        req.supabaseClient,
        storeid
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error('GET /api/products/:storeid error:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }
);

/**
 * GET /api/products/detail/:productid
 * Get single product details
 * Requires: Authentication
 */
router.get(
  '/detail/:productid',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { productid } = req.params;

      if (!productid) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      if (!req.supabaseClient) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await productService.getProduct(req.supabaseClient, productid);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error('GET /api/products/detail/:productid error:', error);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
  }
);

/**
 * PUT /api/products/:productid
 * Update a product
 * Requires: Manager role + store ownership
 */
router.put(
  '/:productid',
  authMiddleware,
  requireManager,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { productid } = req.params;
      const { name, handle, sku, price, description, producttypeid, model, medical_information, status } =
        req.body;

      if (!productid) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Validate data types if provided
      if (price !== undefined && (typeof price !== 'number' || price < 0)) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      if (!req.user?.userid || !req.supabaseClient) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const priceValue =
        typeof price === 'number' ? price : price !== undefined ? parseFloat(String(price)) : undefined;
      const result = await productService.updateProduct(
        req.supabaseClient,
        req.user.userid,
        productid,
        {
          name: name?.trim(),
          handle: handle?.trim().toLowerCase(),
          sku: sku?.trim().toUpperCase(),
          price: priceValue,
          description: description?.trim(),
          product_type: producttypeid,
          model: model?.trim(),
          medical_information: medical_information?.trim(),
          status,
        }
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'Product updated successfully',
      });
    } catch (error) {
      console.error('PUT /api/products/:productid error:', error);
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

/**
 * DELETE /api/products/:productid
 * Delete a product
 * Requires: Manager role + store ownership
 */
router.delete(
  '/:productid',
  authMiddleware,
  requireManager,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { productid } = req.params;

      if (!productid) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      if (!req.user?.userid || !req.supabaseClient) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await productService.deleteProduct(
        req.supabaseClient,
        req.user.userid,
        productid
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('DELETE /api/products/:productid error:', error);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }
);

export default router;