import { supabase } from '@/lib/supabase';
import type { ShopProduct } from '@/lib/category-products';

export type ProductWithImages = ShopProduct & {
  product_images: Array<{
    imageid: string;
    productid: string;
    imageurl: string;
    alttext?: string | null;
    displayorder: number;
  }>;
};

/**
 * Fetch published products with related images from Supabase.
 */
export async function getPublishedProductsWithImages(storeid: string): Promise<ProductWithImages[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      `*,
      product_images (
        imageid,
        productid,
        imageurl,
        alttext,
        displayorder
      )`
    )
    .eq('storeid', storeid)
    .eq('status', 'published')
    .order('createdat', { ascending: false });

  if (error) {
    console.error('Failed to fetch published products with images:', error);
    return [];
  }

  return (data || []) as ProductWithImages[];
}
