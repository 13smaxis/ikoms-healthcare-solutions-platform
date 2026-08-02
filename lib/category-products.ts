
const PRODUCT_TYPE_LABELS: Record<string, string> = {
  '5d929bda-2cf9-4d3c-8957-5a2093d1f34b': 'Clinical Supplies',
  '98753de8-7394-4dc9-8865-db651ac207b3': 'PPE & Safety Equipment',
  '4d71ac64-3355-417d-a454-15a4acd26a03': 'Diagnostic Equipment',
  '341a1e6f-ebe7-446e-a8df-372e312bd588': 'Training & Education',
  '71f0d6be-c2e9-4dec-820c-29f82e3eb477': 'Home Care & Patient Support',
  '3fe11527-e310-4887-95c8-4d16d75be3cd': 'Emergency & First Aid',
  '422f0a13-36ed-461f-adfa-13b8055b8e0f': 'Other',
};

export function getProductTypeLabel(productType?: string | null): string {
  if (!productType) return '';

  const normalized = productType.trim();
  if (!normalized) return '';

  return PRODUCT_TYPE_LABELS[normalized] || normalized;
}

export type ShopProduct = {
  id: string;
  handle: string;
  name: string;
  sku: string;
  product_type: string;
  collectionHandle: string;
  price: number;
  images: string[];
  image_url?: string;
  image?: string;
  tags: string[];
  description: string;
  model?: string;
  key_features?: string[];
  medical_information?: string;
  created_at?: string;
  status?: string;
  productid?: string;
  storeid?: string;
};

export const normalizeShopTag = (value?: string | string[]) => {
  const safeValue = Array.isArray(value) ? value[0] ?? '' : value ?? '';
  return safeValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export function getProductImage(product: Pick<ShopProduct, 'images' | 'image_url' | 'image'>) {
  if (Array.isArray(product.images) && product.images[0]) {
    return product.images[0];
  }

  if (product.image_url) {
    return product.image_url;
  }

  if (product.image) {
    return product.image;
  }

  return '';
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';                                                                       //- Use Next.js routes
const DEFAULT_STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || '';

/**
 * Fetch published products from the backend API
 * This replaces the hardcoded mock data
 */
export async function getProducts(includeInactive = false): Promise<ShopProduct[]> {
  try {
    const storeId = DEFAULT_STORE_ID || (typeof window !== 'undefined' ? localStorage.getItem('storeid') : '');                   //- Get storeid from environment or window
    
    if (!storeId)                                                                                                                 //- Check if storeId is available
    {
      console.warn('No store ID available - using empty array');
      return [];                                                                                                                  //- Return empty array if no storeId
    }

    // ✅ Updated endpoint
    const response = await fetch(`${API_BASE}/products?storeid=${encodeURIComponent(storeId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch products:', response.statusText);
      return [];
    }

    const { data } = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((p) => includeInactive || p.status !== 'inactive')
      .map((product: any) => ({
        id: product.productid,
        handle: product.handle,
        name: product.name,
        sku: product.sku,
        product_type: getProductTypeLabel(product.producttypeid),
        collectionHandle: 'general',
        price: product.price,
        images: product.product_images?.map((img: any) => img.imageurl) || [],
        image_url: product.image_url || product.product_images?.[0]?.imageurl,
        tags: [],
        description: product.description || '',
        model: product.model,
        key_features: product.product_features?.map((f: any) => f.featuretext) || [],
        medical_information: product.medical_information,
        created_at: product.createdat,
        status: product.status,
        productid: product.productid,
        storeid: product.storeid,
      }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export function getProductByHandle(handle: string | string[] | undefined): ShopProduct | null {
  // This will be handled by search on the frontend for now
  // In production, you'd want a dedicated API endpoint
  return null;
}

export function getProductsForCollectionHandle(handle: string | string[] | undefined): ShopProduct[] {
  // This will be handled by filtering on the frontend
  // In production, you'd want a dedicated API endpoint
  return [];
}

export function searchProducts(q: string, limit = 50): ShopProduct[] {
  // This should also call the backend for search
  // For now, implement client-side search if needed
  return [];
}

export function getProductsByIds(ids: string[]): ShopProduct[] {
  // This should call the backend
  // For now, return empty
  return [];
}