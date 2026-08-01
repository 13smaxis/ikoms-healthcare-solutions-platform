
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
        product_type: product.producttypeid || '',
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