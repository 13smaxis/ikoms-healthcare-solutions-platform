import SHOP_MENU from '@/components/shop-menu-config';
import { getCollectionMedia, getProductImagePath } from '@/lib/shop-media';

export type ShopCatalogProduct = {
  id: string;
  handle: string;
  name: string;
  sku: string;
  product_type: string;
  collectionHandle: string;
  price: number;
  images: string[];
  tags: string[];
  description: string;
  inventory_qty: number | null;
};

export type CollectionShowcase = {
  title: string;
  hotBuys: ShopCatalogProduct[];
  carouselImages: string[];
  marqueeImages: string[];
};

const normalizeTag = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

type CollectionSeed = {
  handle: string;
  priceBase: number;
  priceStep: number;
  stockBase: number;
};

const COLLECTION_SEEDS: Record<string, CollectionSeed> = {
  'clinical-supplies': {
    handle: 'clinical-supplies',
    priceBase: 450,
    priceStep: 90,
    stockBase: 120,
  },
  'ppe-safety-equipment': {
    handle: 'ppe-safety-equipment',
    priceBase: 799,
    priceStep: 110,
    stockBase: 180,
  },
  'diagnostic-equipment': {
    handle: 'diagnostic-equipment',
    priceBase: 1299,
    priceStep: 160,
    stockBase: 64,
  },
  'hospital-clinic-furniture': {
    handle: 'hospital-clinic-furniture',
    priceBase: 4900,
    priceStep: 320,
    stockBase: 24,
  },
  'training-educational-supplies': {
    handle: 'training-educational-supplies',
    priceBase: 8900,
    priceStep: 520,
    stockBase: 18,
  },
  'home-care-patient-support': {
    handle: 'home-care-patient-support',
    priceBase: 1850,
    priceStep: 120,
    stockBase: 52,
  },
  'emergency-first-aid': {
    handle: 'emergency-first-aid',
    priceBase: 1495,
    priceStep: 150,
    stockBase: 88,
  },
  'healthcare-technology': {
    handle: 'healthcare-technology',
    priceBase: 2499,
    priceStep: 180,
    stockBase: 41,
  },
};

const slugify = (value: string) => normalizeTag(value);

const buildCatalog = (): ShopCatalogProduct[] => SHOP_MENU.flatMap((collection, collectionIndex) => {
  const seed = COLLECTION_SEEDS[collection.handle];
  if (!seed) return [];

  return collection.items
    .filter((item) => item !== 'Products')
    .map((item, itemIndex) => {
      const itemSlug = slugify(item);
      const handle = `${collection.handle}-${itemSlug}`;
      const price = seed.priceBase + (itemIndex * seed.priceStep) + (collectionIndex * 25);
      const inStock = (collectionIndex + itemIndex) % 6 !== 0;
      const inventory_qty = inStock ? Math.max(1, seed.stockBase - (itemIndex * 2)) : 0;

      return {
        id: `static-${handle}`,
        handle,
        name: item,
        sku: `${collection.handle.slice(0, 3).toUpperCase()}-${String(itemIndex + 1).padStart(3, '0')}`,
        product_type: collection.title,
        collectionHandle: collection.handle,
        price,
        images: [getProductImagePath(collection.handle, item, itemIndex)],
        tags: [collection.handle, collection.title, item, itemSlug, ...(itemIndex < 2 ? ['featured'] : [])],
        description: `${item} for ${collection.title.toLowerCase()}.`,
        inventory_qty,
      };
    });
});

export const SHOP_CATALOG: ShopCatalogProduct[] = buildCatalog();

export const getFeaturedShopProducts = () => SHOP_CATALOG.filter((product) => product.tags.includes('featured'));

export const mergeShopProducts = <T extends { handle: string }>(primary: T[], fallback: T[]) => {
  const seen = new Set(primary.map((product) => product.handle));
  return [...primary, ...fallback.filter((product) => !seen.has(product.handle))];
};

export const getProductsByTag = (tag: string) => {
  const normalizedTag = normalizeTag(tag);
  return SHOP_CATALOG.filter((product) =>
    product.tags.some((candidate) => normalizeTag(candidate) === normalizedTag)
      || normalizeTag(product.product_type) === normalizedTag
      || normalizeTag(product.collectionHandle) === normalizedTag
      || normalizeTag(product.handle) === normalizedTag,
  );
};

export const getProductsForCollectionHandle = (handle: string) => SHOP_CATALOG.filter((product) =>
  normalizeTag(product.collectionHandle) === normalizeTag(handle)
    || product.tags.some((candidate) => normalizeTag(candidate) === normalizeTag(handle))
    || normalizeTag(product.product_type) === normalizeTag(handle),
);

export const getProductByHandle = (handle: string) => SHOP_CATALOG.find((product) => product.handle === handle);

export const normalizeShopTag = normalizeTag;

export const getCollectionShowcase = (handle: string): CollectionShowcase => {
  const normalizedHandle = normalizeTag(handle);
  const title = SHOP_MENU.find((collection) => normalizeTag(collection.handle) === normalizedHandle)?.title || 'Shop';
  const collectionProducts = getProductsForCollectionHandle(normalizedHandle);
  const hotBuys = collectionProducts.filter((product) => product.tags.includes('featured')).slice(0, 4);
  const media = getCollectionMedia(normalizedHandle);

  return {
    title,
    hotBuys: hotBuys.length > 0 ? hotBuys : collectionProducts.slice(0, 4),
    carouselImages: media.carouselImages,
    marqueeImages: media.marqueeImages,
  };
};