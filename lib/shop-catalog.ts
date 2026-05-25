import SHOP_MENU from '@/components/shop-menu-config';

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
  marqueeImages: string[];
};

const normalizeTag = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

type CollectionSeed = {
  handle: string;
  images: string[];
  priceBase: number;
  priceStep: number;
  stockBase: number;
};

export const CLINICAL_SUPPLIES_CAROUSEL_IMAGES = [
  '/images/clinical-supplies/products/face-masks.jpg',
  '/images/clinical-supplies/products/surgical-gloves.jpg',
  '/images/clinical-supplies/products/gauze-bandages.jpg',
  '/images/clinical-supplies/products/syringes.jpg',
];

const COLLECTION_SEEDS: Record<string, CollectionSeed> = {
  'clinical-supplies': {
    handle: 'clinical-supplies',
    images: [
      ...CLINICAL_SUPPLIES_CAROUSEL_IMAGES,
    ],
    priceBase: 450,
    priceStep: 90,
    stockBase: 120,
  },
  'ppe-safety-equipment': {
    handle: 'ppe-safety-equipment',
    images: [
      'https://images.unsplash.com/photo-1584467735871-2d6b6e1d3b0a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=1200&q=80',
    ],
    priceBase: 799,
    priceStep: 110,
    stockBase: 180,
  },
  'diagnostic-equipment': {
    handle: 'diagnostic-equipment',
    images: [
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581093588401-22f9d5c2b3f2?auto=format&fit=crop&w=1200&q=80',
    ],
    priceBase: 1299,
    priceStep: 160,
    stockBase: 64,
  },
  'hospital-clinic-furniture': {
    handle: 'hospital-clinic-furniture',
    images: [
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    ],
    priceBase: 4900,
    priceStep: 320,
    stockBase: 24,
  },
  'training-educational-supplies': {
    handle: 'training-educational-supplies',
    images: [
      'https://images.unsplash.com/photo-1576765607925-5b1b2e0c9b4e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80',
    ],
    priceBase: 8900,
    priceStep: 520,
    stockBase: 18,
  },
  'home-care-patient-support': {
    handle: 'home-care-patient-support',
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580281657527-47b3a9b6d4cb?auto=format&fit=crop&w=1200&q=80',
    ],
    priceBase: 1850,
    priceStep: 120,
    stockBase: 52,
  },
  'emergency-first-aid': {
    handle: 'emergency-first-aid',
    images: [
      'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b3?auto=format&fit=crop&w=1200&q=80',
    ],
    priceBase: 1495,
    priceStep: 150,
    stockBase: 88,
  },
  'healthcare-technology': {
    handle: 'healthcare-technology',
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555774698-0b77e0d5fac7?auto=format&fit=crop&w=1200&q=80',
    ],
    priceBase: 2499,
    priceStep: 180,
    stockBase: 41,
  },
};

export const SHARED_MARQUEE_IMAGES = [
  '/images/clinical-supplies/alcohol-swabs.jpg',
  '/images/clinical-supplies/catheters.jpg',
  '/images/clinical-supplies/disposable-aprons.jpg',
  '/images/clinical-supplies/face-masks.jpg',
  '/images/clinical-supplies/gauze-bandages.jpg',
  '/images/clinical-supplies/iv-cannulas.jpg',
  '/images/clinical-supplies/medical-tape.jpg',
  '/images/clinical-supplies/surgical-gloves.jpg',
  '/images/clinical-supplies/syringes.jpg',
  '/images/clinical-supplies/wound-dressings.jpg',
];

const COLLECTION_MARQUEE_IMAGES: Record<string, string[]> = {
  'clinical-supplies': SHARED_MARQUEE_IMAGES,
  'ppe-safety-equipment': [
    '/images/clinical-supplies/face-masks.jpg',
    '/images/clinical-supplies/surgical-gloves.jpg',
    '/images/clinical-supplies/disposable-aprons.jpg',
    '/images/clinical-supplies/medical-tape.jpg',
    '/images/clinical-supplies/wound-dressings.jpg',
    '/images/clinical-supplies/catheters.jpg',
  ],
  'diagnostic-equipment': [
    '/images/clinical-supplies/iv-cannulas.jpg',
    '/images/clinical-supplies/gauze-bandages.jpg',
    '/images/clinical-supplies/alcohol-swabs.jpg',
    '/images/clinical-supplies/wound-dressings.jpg',
    '/images/clinical-supplies/syringes.jpg',
    '/images/clinical-supplies/medical-tape.jpg',
  ],
  'hospital-clinic-furniture': [
    '/images/clinical-supplies/disposable-aprons.jpg',
    '/images/clinical-supplies/wound-dressings.jpg',
    '/images/clinical-supplies/gauze-bandages.jpg',
    '/images/clinical-supplies/face-masks.jpg',
    '/images/clinical-supplies/catheters.jpg',
    '/images/clinical-supplies/medical-tape.jpg',
  ],
  'training-educational-supplies': [
    '/images/clinical-supplies/alcohol-swabs.jpg',
    '/images/clinical-supplies/syringes.jpg',
    '/images/clinical-supplies/gauze-bandages.jpg',
    '/images/clinical-supplies/iv-cannulas.jpg',
    '/images/clinical-supplies/wound-dressings.jpg',
    '/images/clinical-supplies/disposable-aprons.jpg',
  ],
  'home-care-patient-support': [
    '/images/clinical-supplies/medical-tape.jpg',
    '/images/clinical-supplies/wound-dressings.jpg',
    '/images/clinical-supplies/gauze-bandages.jpg',
    '/images/clinical-supplies/alcohol-swabs.jpg',
    '/images/clinical-supplies/surgical-gloves.jpg',
    '/images/clinical-supplies/catheters.jpg',
  ],
  'emergency-first-aid': [
    '/images/clinical-supplies/wound-dressings.jpg',
    '/images/clinical-supplies/gauze-bandages.jpg',
    '/images/clinical-supplies/alcohol-swabs.jpg',
    '/images/clinical-supplies/syringes.jpg',
    '/images/clinical-supplies/medical-tape.jpg',
    '/images/clinical-supplies/iv-cannulas.jpg',
  ],
  'healthcare-technology': [
    '/images/clinical-supplies/iv-cannulas.jpg',
    '/images/clinical-supplies/syringes.jpg',
    '/images/clinical-supplies/alcohol-swabs.jpg',
    '/images/clinical-supplies/face-masks.jpg',
    '/images/clinical-supplies/gauze-bandages.jpg',
    '/images/clinical-supplies/wound-dressings.jpg',
  ],
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
        images: [seed.images[itemIndex % seed.images.length]],
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
  const marqueeImages = COLLECTION_MARQUEE_IMAGES[normalizedHandle] || SHARED_MARQUEE_IMAGES;

  return {
    title,
    hotBuys: hotBuys.length > 0 ? hotBuys : collectionProducts.slice(0, 4),
    marqueeImages,
  };
};