import { supabase } from '@/lib/supabase';
import type { Store, Product, Collection, Tag, ProductImage, ProductFeature } from '@/types/database';

// ============================================================================
// STORE OPERATIONS
// ============================================================================

export const storeDB = {
  async getMyStore(managerid: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('managerid', managerid)
      .single();

    if (error && error.code !== 'PGRST116') console.error('Error fetching store:', error);
    return data || null;
  },

  async getAllStores(): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('status', 'active');

    if (error) console.error('Error fetching stores:', error);
    return data || [];
  },

  async updateStore(storeid: string, updates: Partial<Store>): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .update({
        ...updates,
        updatedat: new Date().toISOString(),
      })
      .eq('storeid', storeid)
      .select()
      .single();

    if (error) console.error('Error updating store:', error);
    return data || null;
  },

  async createStore(store: Omit<Store, 'storeid' | 'createdat' | 'updatedat'>): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .insert([store])
      .select()
      .single();

    if (error) console.error('Error creating store:', error);
    return data || null;
  },
};

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

export const productDB = {
  async getProductsByStore(storeid: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('storeid', storeid)
      .order('createdat', { ascending: false });

    if (error) console.error('Error fetching products:', error);
    return data || [];
  },

  async getProductById(productid: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('productid', productid)
      .single();

    if (error && error.code !== 'PGRST116') console.error('Error fetching product:', error);
    return data || null;
  },

  async createProduct(product: Omit<Product, 'productid' | 'createdat' | 'updatedat'>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) console.error('Error creating product:', error);
    return data || null;
  },

  async updateProduct(productid: string, updates: Partial<Product>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updatedat: new Date().toISOString(),
      })
      .eq('productid', productid)
      .select()
      .single();

    if (error) console.error('Error updating product:', error);
    return data || null;
  },

  async deleteProduct(productid: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('productid', productid);

    if (error) console.error('Error deleting product:', error);
    return !error;
  },

  async getPublishedProducts(storeid: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('storeid', storeid)
      .eq('status', 'published')
      .order('createdat', { ascending: false });

    if (error) console.error('Error fetching published products:', error);
    return data || [];
  },
};

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

export const productImageDB = {
  async getImagesByProduct(productid: string): Promise<ProductImage[]> {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('productid', productid)
      .order('displayorder', { ascending: true });

    if (error) console.error('Error fetching images:', error);
    return data || [];
  },

  async addImage(image: Omit<ProductImage, 'imageid' | 'createdat' | 'updatedat'>): Promise<ProductImage | null> {
    const { data, error } = await supabase
      .from('product_images')
      .insert([image])
      .select()
      .single();

    if (error) console.error('Error adding image:', error);
    return data || null;
  },

  async updateImage(imageid: string, updates: Partial<ProductImage>): Promise<ProductImage | null> {
    const { data, error } = await supabase
      .from('product_images')
      .update({
        ...updates,
        updatedat: new Date().toISOString(),
      })
      .eq('imageid', imageid)
      .select()
      .single();

    if (error) console.error('Error updating image:', error);
    return data || null;
  },

  async deleteImage(imageid: string): Promise<boolean> {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('imageid', imageid);

    if (error) console.error('Error deleting image:', error);
    return !error;
  },
};

// ============================================================================
// COLLECTIONS
// ============================================================================

export const collectionDB = {
  async getCollectionsByStore(storeid: string): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('storeid', storeid)
      .order('displayorder', { ascending: true });

    if (error) console.error('Error fetching collections:', error);
    return data || [];
  },

  async createCollection(collection: Omit<Collection, 'collectionid' | 'createdat'>): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .insert([collection])
      .select()
      .single();

    if (error) console.error('Error creating collection:', error);
    return data || null;
  },

  async updateCollection(collectionid: string, updates: Partial<Collection>): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .update({
        ...updates,
        updatedat: new Date().toISOString(),
      })
      .eq('collectionid', collectionid)
      .select()
      .single();

    if (error) console.error('Error updating collection:', error);
    return data || null;
  },

  async deleteCollection(collectionid: string): Promise<boolean> {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('collectionid', collectionid);

    if (error) console.error('Error deleting collection:', error);
    return !error;
  },
};

// ============================================================================
// TAGS
// ============================================================================

export const tagDB = {
  async getTagsByStore(storeid: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('storeid', storeid)
      .order('tagname', { ascending: true });

    if (error) console.error('Error fetching tags:', error);
    return data || [];
  },

  async createTag(tag: Omit<Tag, 'tagid' | 'createdat'>): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single();

    if (error) console.error('Error creating tag:', error);
    return data || null;
  },

  async deleteTag(tagid: string): Promise<boolean> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('tagid', tagid);

    if (error) console.error('Error deleting tag:', error);
    return !error;
  },
};

// ============================================================================
// PRODUCT FEATURES
// ============================================================================

export const productFeatureDB = {
  async getFeaturesByProduct(productid: string): Promise<ProductFeature[]> {
    const { data, error } = await supabase
      .from('product_features')
      .select('*')
      .eq('productid', productid)
      .order('createdat', { ascending: true });

    if (error) console.error('Error fetching features:', error);
    return data || [];
  },

  async addFeature(feature: Omit<ProductFeature, 'featureid' | 'createdat' | 'updatedat'>): Promise<ProductFeature | null> {
    const { data, error } = await supabase
      .from('product_features')
      .insert([feature])
      .select()
      .single();

    if (error) console.error('Error adding feature:', error);
    return data || null;
  },

  async deleteFeature(featureid: string): Promise<boolean> {
    const { error } = await supabase
      .from('product_features')
      .delete()
      .eq('featureid', featureid);

    if (error) console.error('Error deleting feature:', error);
    return !error;
  },
};