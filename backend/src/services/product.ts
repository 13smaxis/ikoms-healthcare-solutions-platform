import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase.js';

export interface CreateProductInput {
  productid?: string;
  name: string;
  handle: string;
  sku: string;
  price: number;
  description?: string;
  product_type?: string;
  collectionHandle?: string;
  model?: string;
  medical_information?: string;
  status?: 'draft' | 'published' | 'archived' | 'active' | 'inactive';
  images?: string[];
  tags?: string[];
  key_features?: string[];
}

export interface UpdateProductInput {
  name?: string;
  handle?: string;
  sku?: string;
  price?: number;
  description?: string;
  product_type?: string;
  collectionHandle?: string;
  model?: string;
  medical_information?: string;
  status?: 'draft' | 'published' | 'archived' | 'active' | 'inactive';
  images?: string[];
  tags?: string[];
  key_features?: string[];
}

export interface ProductResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const normalizeCollectionHandle = (value?: string) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureTags = async (
  client: SupabaseClient,
  storeid: string,
  tags: string[]
): Promise<string[]> => {
  const normalizedTags = Array.from(
    new Set(tags.map((tag) => tag?.trim()).filter(Boolean))
  );

  if (!normalizedTags.length) return [];

  const { data: existingTags } = await client
    .from('tags')
    .select('tagid, tagname')
    .eq('storeid', storeid)
    .in('tagname', normalizedTags);

  const existingTagMap = new Map<string, string>();
  (existingTags || []).forEach((tag: any) => {
    existingTagMap.set(tag.tagname, tag.tagid);
  });

  const missingTags = normalizedTags.filter((tag) => !existingTagMap.has(tag));
  if (missingTags.length) {
    const toInsert = missingTags.map((tag) => ({
      tagid: uuidv4(),
      storeid,
      tagname: tag,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
    }));
    const { data: insertedTags } = await client
      .from('tags')
      .insert(toInsert)
      .select('tagid, tagname');

    (insertedTags || []).forEach((tag: any) => {
      existingTagMap.set(tag.tagname, tag.tagid);
    });
  }

  return normalizedTags
    .map((tag) => existingTagMap.get(tag))
    .filter(Boolean) as string[];
};

const ensureCollection = async (
  client: SupabaseClient,
  storeid: string,
  collectionHandle?: string
): Promise<string | null> => {
  const handle = normalizeCollectionHandle(collectionHandle);
  if (!handle) return null;

  const { data: existingCollection, error } = await client
    .from('collections')
    .select('collectionid')
    .eq('storeid', storeid)
    .eq('handle', handle)
    .maybeSingle();

  if (error) {
    console.error('Collection lookup error:', error);
    return null;
  }

  if (existingCollection?.collectionid) {
    return existingCollection.collectionid;
  }

  const name = collectionHandle?.trim() || handle;
  const { data: inserted } = await client
    .from('collections')
    .insert([
      {
        collectionid: uuidv4(),
        storeid,
        name,
        handle,
        displayorder: 0,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      },
    ])
    .select('collectionid')
    .single();

  return inserted?.collectionid || null;
};

const syncProductRelations = async (
  client: SupabaseClient,
  storeid: string,
  productid: string,
  images: string[] = [],
  features: string[] = [],
  tags: string[] = [],
  collectionHandle?: string
) => {
  await Promise.all([
    client.from('product_images').delete().eq('productid', productid),
    client.from('product_features').delete().eq('productid', productid),
    client.from('product_tags').delete().eq('productid', productid),
    client.from('products_collections').delete().eq('productid', productid),
  ]);

  if (images.length) {
    const imageRows = images
      .filter(Boolean)
      .map((imageurl, index) => ({
        imageid: uuidv4(),
        productid,
        imageurl,
        alttext: null,
        displayorder: index,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      }));

    await client.from('product_images').insert(imageRows);
  }

  if (features.length) {
    const featureRows = features
      .filter(Boolean)
      .map((featuretext, index) => ({
        featureid: uuidv4(),
        productid,
        featuretext,
        displayorder: index,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      }));

    await client.from('product_features').insert(featureRows);
  }

  const tagIds = await ensureTags(client, storeid, tags);
  if (tagIds.length) {
    const productTagRows = tagIds.map((tagid) => ({
      productid,
      tagid,
      createdat: new Date().toISOString(),
    }));
    await client.from('product_tags').insert(productTagRows);
  }

  if (collectionHandle) {
    const collectionid = await ensureCollection(client, storeid, collectionHandle);
    if (collectionid) {
      await client
        .from('products_collections')
        .insert([{ productid, collectionid, createdat: new Date().toISOString() }]);
    }
  }
};

const buildProductPayload = (input: CreateProductInput | UpdateProductInput) => {
  const payload: Record<string, any> = {};

  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.handle !== undefined) payload.handle = input.handle.trim().toLowerCase();
  if (input.sku !== undefined) payload.sku = input.sku.trim().toUpperCase();
  if (input.price !== undefined) payload.price = input.price;
  if (input.description !== undefined) payload.description = input.description.trim() || null;
  if (input.model !== undefined) payload.model = input.model.trim() || null;
  if (input.medical_information !== undefined)
    payload.medical_information = input.medical_information.trim() || null;
  if (input.status !== undefined) payload.status = input.status;
  if (input.product_type !== undefined) payload.producttypeid = input.product_type || null;

  return payload;
};

const hydrateProduct = async (
  client: SupabaseClient,
  product: any
) => {
  const [imagesResult, featuresResult, tagRelationsResult, collectionRelationResult] = await Promise.all([
    client
      .from('product_images')
      .select('imageurl')
      .eq('productid', product.productid)
      .order('displayorder', { ascending: true }),
    client
      .from('product_features')
      .select('featuretext')
      .eq('productid', product.productid)
      .order('displayorder', { ascending: true }),
    client
      .from('product_tags')
      .select('tags ( tagname )')
      .eq('productid', product.productid),
    client
      .from('products_collections')
      .select('collections ( handle )')
      .eq('productid', product.productid)
      .maybeSingle(),
  ]);

  const images = (imagesResult.data || []).map((row: any) => row.imageurl);
  const key_features = (featuresResult.data || []).map((row: any) => row.featuretext);
  const tags = (tagRelationsResult.data || [])
    .map((row: any) => row.tags?.tagname)
    .filter(Boolean);
  const collectionHandle =
    (collectionRelationResult.data?.collections?.[0]?.handle as string) || '';

  return {
    ...product,
    images,
    key_features,
    tags,
    collectionHandle,
    product_type: product.producttypeid || '',
  };
};

/**
 * Product Service - All database operations with authorization
 */
export const productService = {
  /**
   * Create a new product
   * Only managers can create products for their store
   */
  async createProduct(
    client: SupabaseClient,
    userId: string,
    storeid: string,
    input: CreateProductInput
  ): Promise<ProductResponse> {
    try {
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

      const productid = input.productid?.trim() || uuidv4();
      const payload = {
        productid,
        storeid,
        ...buildProductPayload(input),
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      };

      const { data, error } = await client
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error || !data) {
        console.error('Product creation error:', error);
        return { success: false, error: error?.message || 'Failed to create product' };
      }

      await syncProductRelations(
        client,
        storeid,
        productid,
        input.images || [],
        input.key_features || [],
        input.tags || [],
        input.collectionHandle
      );

      const product = await hydrateProduct(client, data);
      await productService.logAudit(userId, 'products', productid, 'CREATE', null, product);

      return { success: true, data: product };
    } catch (error) {
      console.error('Create product error:', error);
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
        .select('*')
        .eq('productid', productid)
        .single();

      if (productError || !product) {
        return { success: false, error: 'Product not found' };
      }

      const { data: store, error: storeError } = await client
        .from('stores')
        .select('managerid')
        .eq('storeid', product.storeid)
        .single();

      if (storeError || store?.managerid !== userId) {
        return { success: false, error: 'Unauthorized: You cannot modify this product' };
      }

      const oldProduct = product;
      const updateData: Record<string, any> = {
        ...buildProductPayload(input),
        updatedat: new Date().toISOString(),
      };

      Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

      const { data, error } = await client
        .from('products')
        .update(updateData)
        .eq('productid', productid)
        .select()
        .single();

      if (error || !data) {
        console.error('Product update error:', error);
        return { success: false, error: error?.message || 'Failed to update product' };
      }

      await syncProductRelations(
        client,
        product.storeid,
        productid,
        input.images || [],
        input.key_features || [],
        input.tags || [],
        input.collectionHandle
      );

      const updatedProduct = await hydrateProduct(client, data);
      await productService.logAudit(userId, 'products', productid, 'UPDATE', oldProduct, updatedProduct);

      return { success: true, data: updatedProduct };
    } catch (error) {
      console.error('Update product error:', error);
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

      const { data: store, error: storeError } = await client
        .from('stores')
        .select('managerid')
        .eq('storeid', product.storeid)
        .single();

      if (storeError || store?.managerid !== userId) {
        return { success: false, error: 'Unauthorized: You cannot delete this product' };
      }

      await Promise.all([
        client.from('product_images').delete().eq('productid', productid),
        client.from('product_features').delete().eq('productid', productid),
        client.from('product_tags').delete().eq('productid', productid),
        client.from('products_collections').delete().eq('productid', productid),
      ]);

      const { error: deleteError } = await client
        .from('products')
        .delete()
        .eq('productid', productid);

      if (deleteError) {
        console.error('Product deletion error:', deleteError);
        return { success: false, error: deleteError.message };
      }

      await productService.logAudit(userId, 'products', productid, 'DELETE', product, null);
      return { success: true, data: { productid } };
    } catch (error) {
      console.error('Delete product error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      };
    }
  },

  /**
   * Get products for a store
   */
  async getProductsByStore(
    client: SupabaseClient,
    storeid: string
  ): Promise<ProductResponse> {
    try {
      const { data: products, error: productsError } = await client
        .from('products')
        .select('*')
        .eq('storeid', storeid)
        .order('createdat', { ascending: false });

      if (productsError) {
        return { success: false, error: productsError.message };
      }

      if (!products?.length) {
        return { success: true, data: [] };
      }

      const productIds = products.map((item: any) => item.productid);

      const [imagesResult, featuresResult, tagRelationsResult, collectionRelationsResult] = await Promise.all([
        client
          .from('product_images')
          .select('productid, imageurl, displayorder')
          .in('productid', productIds)
          .order('displayorder', { ascending: true }),
        client
          .from('product_features')
          .select('productid, featuretext, displayorder')
          .in('productid', productIds)
          .order('displayorder', { ascending: true }),
        client
          .from('product_tags')
          .select('productid, tags ( tagname )')
          .in('productid', productIds),
        client
          .from('products_collections')
          .select('productid, collections ( handle )')
          .in('productid', productIds),
      ]);

      const productList = products.map((product: any) => {
        const images = (imagesResult.data || [])
          .filter((row: any) => row.productid === product.productid)
          .map((row: any) => row.imageurl);
        const key_features = (featuresResult.data || [])
          .filter((row: any) => row.productid === product.productid)
          .map((row: any) => row.featuretext);
        const tags = (tagRelationsResult.data || [])
          .filter((row: any) => row.productid === product.productid)
          .map((row: any) => row.tags?.tagname)
          .filter(Boolean);
        const collectionHandle =
          (collectionRelationsResult.data || [])
            .find((row: any) => row.productid === product.productid)
            ?.collections?.[0]?.handle || '';

        return {
          ...product,
          images,
          key_features,
          tags,
          collectionHandle,
          product_type: product.producttypeid || '',
        };
      });

      return { success: true, data: productList };
    } catch (error) {
      console.error('Get products error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  },

  /**
   * Get single product
   */
  async getProduct(client: SupabaseClient, productid: string): Promise<ProductResponse> {
    try {
      const { data: product, error } = await client
        .from('products')
        .select('*')
        .eq('productid', productid)
        .single();

      if (error || !product) {
        return { success: false, error: 'Product not found' };
      }

      const hydrated = await hydrateProduct(client, product);
      return { success: true, data: hydrated };
    } catch (error) {
      console.error('Get product error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      };
    }
  },

  /**
   * Log audit trail for all operations
   * Uses admin client to bypass RLS
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
      // Don't fail the operation if audit logging fails
    }
  },
};