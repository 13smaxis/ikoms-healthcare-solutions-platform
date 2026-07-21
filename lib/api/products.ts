

import { getAuthToken } from '../auth/client';

const API_BASE = '/api';                                                                                                          //- No http://localhost:PORT with Next.js API routes, just use relative path

/**
 * Fetch published products for a store (PUBLIC)
 */
export async function getPublishedProducts(storeid: string) {
  try {
    const response = await fetch(
      `${API_BASE}/products?storeid=${encodeURIComponent(storeid)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch products');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('❌ Failed to fetch published products:', error);
    throw error;
  }
}

/**
 * Fetch single product (PUBLIC)
 */
export async function getProduct(productid: string) {
  try {
    const response = await fetch(
      `${API_BASE}/products?productid=${encodeURIComponent(productid)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Product not found');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ Failed to fetch product:', error);
    throw error;
  }
}

/**
 * Fetch all products for a store - ADMIN (requires auth)
 */
export async function getAdminProducts(storeid: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE}/admin/products?storeid=${encodeURIComponent(storeid)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch products');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('❌ Failed to fetch admin products:', error);
    throw error;
  }
}

/**
 * Create a new product (requires auth)
 */
export async function createProduct(input: {
  storeid: string;
  name: string;
  handle: string;
  sku: string;
  price: number;
  description?: string;
  producttypeid?: string;
  model?: string;
  medical_information?: string;
  status?: 'draft' | 'published' | 'archived';
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ Failed to create product:', error);
    throw error;
  }
}

/**
 * Update an existing product (requires auth)
 */
export async function updateProduct(
  productid: string,
  input: {
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
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/admin/products/${productid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ Failed to update product:', error);
    throw error;
  }
}

/**
 * Delete a product (requires auth)
 */
export async function deleteProduct(productid: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/admin/products/${productid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ Failed to delete product:', error);
    throw error;
  }
}