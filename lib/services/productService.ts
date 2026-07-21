
/*
 * Product Service business logic for managing products in the application.
 * This service provides methods for creating, updating, deleting, and fetching products.
 * It interacts with the Supabase database and ensures proper authorization checks are performed.
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase'; // Update import path

export interface CreateProductInput {
  name: string;
  handle: string;
  sku: string;
  price: number;
  description?: string;
  producttypeid?: string;
  model?: string;
  medical_information?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateProductInput {
  name?: string;
  handle?: string;
  sku?: string;
  price?: number;
  description?: string;
  producttypeid?: string;
  model?: string;
  medical_information?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface ProductResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const productService = {
  /**
   * Create a new product
   */
  async createProduct(
    client: SupabaseClient,
    userId: string,
    storeid: string,
    input: CreateProductInput
  ): Promise<ProductResponse> {
    try {
      // Verify user owns the store
      const { data: store, error: storeError } = await client
        .from('stores')
        .select('storeid, managerid')
        .eq('storeid', storeid)
        .single();

      if (storeError || !store) {
        return { success: false, error: 'Store not found' };
      }

      if (store.managerid !== userId) {
        return { success: false, error: 'Unauthorized: You do not own this store' };
      }

      const { data, error } = await client
        .from('products')
        .insert([
          {
            storeid,
            name: input.name,
            handle: input.handle,
            sku: input.sku,
            price: input.price,
            description: input.description || null,
            producttypeid: input.producttypeid || null,
            model: input.model || null,
            medical_information: input.medical_information || null,
            status: input.status || 'draft',
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log audit
      await productService.logAudit(userId, 'products', data.productid, 'CREATE', null, data);

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      };
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    client: SupabaseClient,
    userId: string,
    productid: string,
    input: UpdateProductInput
  ): Promise<ProductResponse> {
    try {
      const { data: product, error: productError } = await client
        .from('products')
        .select('productid, storeid')
        .eq('productid', productid)
        .single();

      if (productError || !product) {
        return { success: false, error: 'Product not found' };
      }

      const { data: store } = await client
        .from('stores')
        .select('managerid')
        .eq('storeid', product.storeid)
        .single();

      if (store?.managerid !== userId) {
        return { success: false, error: 'Unauthorized: You cannot modify this product' };
      }

      const { data: oldProduct } = await client
        .from('products')
        .select('*')
        .eq('productid', productid)
        .single();

      const updateData: Record<string, any> = {
        ...input,
        updatedat: new Date().toISOString(),
      };

      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      const { data, error } = await client
        .from('products')
        .update(updateData)
        .eq('productid', productid)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      await productService.logAudit(userId, 'products', productid, 'UPDATE', oldProduct, data);

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      };
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(
                        client: SupabaseClient,
                        userId: string,
    productid: string
  ): Promise<ProductResponse> {
    try {
      const { data: product, error: productError } = await client
        .from('products')
        .select('productid, storeid, name, sku')
        .eq('productid', productid)
        .single();

      if (productError || !product) {
        return { success: false, error: 'Product not found' };
      }

      const { data: store } = await client
        .from('stores')
        .select('managerid')
        .eq('storeid', product.storeid)
        .single();

      if (store?.managerid !== userId) {
        return { success: false, error: 'Unauthorized: You cannot delete this product' };
      }

      const { error: deleteError } = await client
        .from('products')
        .delete()
        .eq('productid', productid);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      await productService.logAudit(userId, 'products', productid, 'DELETE', product, null);

      return { success: true, data: { productid } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      };
    }
  },

  /**
   * Get all products for a store (admin)
   */
  async getProductsByStore(
                            client: SupabaseClient,
                            storeid: string
  ): Promise<ProductResponse> {
    try {
      const { data, error } = await client
        .from('products')
        .select(
          `*,
          product_features (
            featureid,
            featuretext
          ),
          product_images (
            imageid,
            imageurl,
            alttext,
            displayorder
          )`
        )
        .eq('storeid', storeid)
        .order('createdat', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  },

  /**
   * Get published products for a store (public)
   */
  async getPublishedProductsByStore(storeid: string): Promise<ProductResponse> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select(
          `*,
          product_features (
            featureid,
            featuretext
          ),
          product_images (
            imageid,
            imageurl,
            alttext,
            displayorder
          )`
        )
        .eq('storeid', storeid)
        .eq('status', 'published')
        .order('createdat', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  },

  /**
   * Get single product
   */
  async getProduct(productid: string): Promise<ProductResponse> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select(
          `*,
          product_features (
            featureid,
            featuretext
          ),
          product_images (
            imageid,
            imageurl,
            alttext,
            displayorder
          )`
        )
        .eq('productid', productid)
        .single();

      if (error) {
        return { success: false, error: 'Product not found' };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      };
    }
  },

  /**
   * Log audit trail
   */
  async logAudit(
    userId: string,
    entityType: string,
    entityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    oldValues: any,
    newValues: any
  ) {
    try {
      await supabaseAdmin.from('audit_logs').insert([
        {
          userid: userId,
          entitytype: entityType,
          entityid: entityId,
          action,
          oldvalues: oldValues,
          newvalues: newValues,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  },
};