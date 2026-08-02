
/*
 * Responsible for making API requests to the backend for product-related operations.
 * This hook handles authentication, request building, and response parsing.
 */
"use client";

import { useCallback, useState } from 'react';
import { getAuthToken } from '@/lib/auth/client';
import { getProductTypeLabel, type ShopProduct } from '@/lib/category-products';

// Use same domain/protocol - no need to specify localhost:3001
const BACKEND_URL = '';

/*
 * Maps the backend product object to the ShopProduct interface used in the frontend.
 * Responsible for transforming field names and handling optional fields.
 */
const mapBackendProduct = (product: any): ShopProduct => ({
  id: product.productid,
  handle: product.handle || '',
  name: product.name || '',
  sku: product.sku || '',
  product_type: getProductTypeLabel(product.producttypeid),
  collectionHandle: product.collectionHandle || '',
  price: Number(product.price) || 0,
  images: Array.isArray(product.product_images)
    ? product.product_images.map((img: any) => img.imageurl)
    : product.image_url
    ? [product.image_url]
    : [],
  image_url: product.image_url || (Array.isArray(product.product_images) ? product.product_images[0]?.imageurl : ''),
  tags: Array.isArray(product.tags) ? product.tags : [],
  description: product.description || '',
  model: product.model || '',
  key_features: Array.isArray(product.product_features) 
    ? product.product_features.map((f: any) => f.featuretext)
    : [],
  medical_information: product.medical_information || '',
  created_at: product.createdat || '',
  status: product.status || 'draft',
});

const buildProductPayload = (product: ShopProduct) => ({
  name: product.name,
  handle: product.handle,
  sku: product.sku,
  price: product.price,
  description: product.description,
  producttypeid: product.product_type,
  model: product.model,
  medical_information: product.medical_information,
  status: product.status,
});

const getHeaders = async () => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || 'Invalid JSON response');
  }
};

export function useProductAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T>(path: string, options: RequestInit = {}) => {
      setLoading(true);
      setError(null);

      try {
        const url = `${BACKEND_URL}${path}`;
        let headers = await getHeaders();

        console.log('📡 Fetching:', url);

        let response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...(options.headers || {}),
          },
        });

        if (response.status === 401) {
          headers = await getHeaders();
          response = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              ...(options.headers || {}),
            },
          });
        }

        const json = await parseResponse<any>(response);
        if (!response.ok) {
          throw new Error(json?.error || json?.message || 'Request failed');
        }

        return json;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Request failed';
        setError(message);
        console.error('❌ API Error:', message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get all products for a store (admin view - includes all statuses)
   */
  const getProductsByStore = useCallback(
    async (storeid: string): Promise<ShopProduct[] | null> => {
      // ✅ FIXED: Use /api/admin/products?storeid= endpoint
      const json = await request(`/api/admin/products?storeid=${encodeURIComponent(storeid)}`);
      if (!json) return null;
      return Array.isArray(json.data) ? json.data.map(mapBackendProduct) : [];
    },
    [request]
  );

  /**
   * Create a new product
   */
  const createProduct = useCallback(
    async (storeid: string, product: ShopProduct): Promise<ShopProduct | null> => {
      const payload = buildProductPayload(product);
      // ✅ FIXED: Use /api/admin/products endpoint
      const json = await request('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          storeid,  // Include storeid in payload
          ...payload,
        }),
      });
      if (!json) return null;
      return mapBackendProduct(json.data);
    },
    [request]
  );

  /**
   * Update an existing product
   */
  const updateProduct = useCallback(
    async (productid: string, product: ShopProduct): Promise<ShopProduct | null> => {
      const payload = buildProductPayload(product);
      // ✅ FIXED: Use /api/admin/products/{id} endpoint
      const json = await request(`/api/admin/products/${encodeURIComponent(productid)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!json) return null;
      return mapBackendProduct(json.data);
    },
    [request]
  );

  /**
   * Delete a product
   */
  const deleteProduct = useCallback(
    async (productid: string): Promise<boolean> => {
      // ✅ FIXED: Use /api/admin/products/{id} endpoint
      const json = await request(`/api/admin/products/${encodeURIComponent(productid)}`, {
        method: 'DELETE',
      });
      return Boolean(json && json.success);
    },
    [request]
  );

  return {
    getProductsByStore,
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
    error,
  };
}
