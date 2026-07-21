"use client";

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ShopProduct } from '@/lib/category-products';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const mapBackendProduct = (product: any): ShopProduct => ({
  id: product.productid,
  handle: product.handle || '',
  name: product.name || '',
  sku: product.sku || '',
  product_type: product.producttypeid || '',
  collectionHandle: product.collectionHandle || '',
  price: Number(product.price) || 0,
  images: Array.isArray(product.images) ? product.images : [],
  tags: Array.isArray(product.tags) ? product.tags : [],
  description: product.description || '',
  model: product.model || '',
  key_features: Array.isArray(product.key_features) ? product.key_features : [],
  medical_information: product.medical_information || '',
  created_at: product.createdat || '',
  status: product.status || 'draft',
});

const buildProductPayload = (product: ShopProduct) => ({
  productid: product.id || undefined,
  name: product.name,
  handle: product.handle,
  sku: product.sku,
  price: product.price,
  description: product.description,
  producttypeid: product.product_type,
  collectionHandle: product.collectionHandle,
  model: product.model,
  medical_information: product.medical_information,
  status: product.status,
  images: product.images,
  tags: product.tags,
  key_features: product.key_features,
});

const getHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
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
        const headers = await getHeaders();
        const response = await fetch(`${BACKEND_URL}${path}`, {
          ...options,
          headers: {
            ...headers,
            ...(options.headers || {}),
          },
        });

        const json = await parseResponse<any>(response);
        if (!response.ok) {
          throw new Error(json?.error || json?.message || 'Request failed');
        }

        return json;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Request failed';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getProductsByStore = useCallback(
    async (storeid: string): Promise<ShopProduct[] | null> => {
      const json = await request(`/api/products/${encodeURIComponent(storeid)}`);
      if (!json) return null;
      return Array.isArray(json.data) ? json.data.map(mapBackendProduct) : [];
    },
    [request]
  );

  const createProduct = useCallback(
    async (product: ShopProduct): Promise<ShopProduct | null> => {
      const payload = buildProductPayload(product);
      const json = await request('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!json) return null;
      return mapBackendProduct(json.data);
    },
    [request]
  );

  const updateProduct = useCallback(
    async (productid: string, product: ShopProduct): Promise<ShopProduct | null> => {
      const payload = buildProductPayload(product);
      const json = await request(`/api/products/${encodeURIComponent(productid)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!json) return null;
      return mapBackendProduct(json.data);
    },
    [request]
  );

  const deleteProduct = useCallback(
    async (productid: string): Promise<boolean> => {
      const json = await request(`/api/products/${encodeURIComponent(productid)}`, {
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
