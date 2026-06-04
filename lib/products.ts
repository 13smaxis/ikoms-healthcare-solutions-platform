import { supabase } from '@/lib/supabase';

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
  inventory_qty: number | null;
  created_at?: string;
  status?: string;
};

type ProductQuery = {
  q?: string;
  handle?: string;
  collectionHandle?: string;
  ids?: string[];
  limit?: number;
};

type LocalCollection = {
  title: string;
  handle: string;
  items: string[];
};

type ProductRecord = {
  id?: string;
  handle?: string;
  name?: string;
  sku?: string;
  product_type?: string;
  collectionHandle?: string;
  collection_handle?: string;
  price?: number | string;
  images?: unknown;
  image_url?: unknown;
  image?: unknown;
  tags?: unknown;
  description?: string;
  inventory_qty?: number | null;
  created_at?: string;
  status?: string;
};

const SOURCE_MODE = process.env.NEXT_PUBLIC_PRODUCT_SOURCE === 'local' ? 'local' : 'db';

const LOCAL_COLLECTIONS: LocalCollection[] = [
  {
    title: 'Clinical Supplies',
    handle: 'clinical-supplies',
    items: [
      'Products',
      'Surgical Gloves',
      'Face Masks',
      'Syringes',
      'Gauze & Bandages',
      'Alcohol Swabs',
      'IV Cannulas',
      'Wound Dressings',
      'Disposable Aprons',
      'Catheters',
      'Medical Tape',
    ],
  },
  {
    title: 'PPE & Safety Equipment',
    handle: 'ppe-safety-equipment',
    items: [
      'Products',
      'N95 Masks',
      'Protective Gowns',
      'Face Shields',
      'Safety Goggles',
      'Hand Sanitizers',
      'Biohazard Bags',
      'Disposable Shoe Covers',
      'Medical Caps',
      'Protective Coveralls',
    ],
  },
  {
    title: 'Diagnostic Equipment',
    handle: 'diagnostic-equipment',
    items: [
      'Products',
      'Blood Pressure Monitors',
      'Thermometers',
      'Pulse Oximeters',
      'Glucometers',
      'Stethoscopes',
      'ECG Machines',
      'Otoscopes',
      'Weighing Scales',
      'Examination Lights',
    ],
  },
  {
    title: 'Hospital & Clinic Furniture',
    handle: 'hospital-clinic-furniture',
    items: [
      'Products',
      'Hospital Beds',
      'Examination Couches',
      'Wheelchairs',
      'Bedside Lockers',
      'Medical Trolleys',
      'IV Stands',
      'Waiting Room Chairs',
      'Patient Stretchers',
    ],
  },
  {
    title: 'Training & Educational Supplies',
    handle: 'training-educational-supplies',
    items: [
      'Products',
      'Nursing Training Kits',
      'CPR Manikins',
      'Anatomy Models',
      'Medical Textbooks',
      'Training Uniforms',
      'Simulation Equipment',
      'First Aid Training Kits',
    ],
  },
  {
    title: 'Home Care & Patient Support',
    handle: 'home-care-patient-support',
    items: [
      'Products',
      'Walking Frames',
      'Crutches',
      'Nebulizers',
      'Adult Diapers',
      'Home Care Beds',
      'Mobility Aids',
      'Blood Sugar Monitors',
      'Orthopedic Pillows',
    ],
  },
  {
    title: 'Emergency & First Aid',
    handle: 'emergency-first-aid',
    items: [
      'Products',
      'First Aid Kits',
      'Emergency Stretchers',
      'Burn Kits',
      'Trauma Bags',
      'AED Machines',
      'Oxygen Cylinders',
      'Emergency Blankets',
    ],
  },
  {
    title: 'Healthcare Technology',
    handle: 'healthcare-technology',
    items: [
      'Products',
      'Patient Management Tablets',
      'Medical Software',
      'Digital Appointment Systems',
      'Smart Health Devices',
      'Telemedicine Equipment',
    ],
  },
];

const COLLECTION_SEEDS: Record<string, { priceBase: number; priceStep: number; stockBase: number }> = {
  'clinical-supplies': { priceBase: 450, priceStep: 90, stockBase: 120 },
  'ppe-safety-equipment': { priceBase: 799, priceStep: 110, stockBase: 180 },
  'diagnostic-equipment': { priceBase: 1299, priceStep: 160, stockBase: 64 },
  'hospital-clinic-furniture': { priceBase: 4900, priceStep: 320, stockBase: 24 },
  'training-educational-supplies': { priceBase: 8900, priceStep: 520, stockBase: 18 },
  'home-care-patient-support': { priceBase: 1850, priceStep: 120, stockBase: 52 },
  'emergency-first-aid': { priceBase: 1495, priceStep: 150, stockBase: 88 },
  'healthcare-technology': { priceBase: 2499, priceStep: 180, stockBase: 41 },
};

export const normalizeShopTag = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const slugify = (value: string) => normalizeShopTag(value);

const getProductImagePath = (collectionHandle: string, productName: string) =>
  `/images/${slugify(collectionHandle)}/${slugify(productName)}.jpg`;

const toStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
};

const normalizeImages = (product: ProductRecord) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return toStringArray(product.images);
  }

  const image = typeof product.image_url === 'string' ? product.image_url : typeof product.image === 'string' ? product.image : '';
  return image ? [image] : [];
};

const normalizeProduct = (product: ProductRecord): ShopProduct => {
  const images = normalizeImages(product);
  const imageUrl = typeof product.image_url === 'string' ? product.image_url : typeof product.image === 'string' ? product.image : images[0] || '';

  return {
    id: String(product.id ?? ''),
    handle: String(product.handle ?? ''),
    name: String(product.name ?? ''),
    sku: String(product.sku ?? ''),
    product_type: String(product.product_type ?? ''),
    collectionHandle: String(product.collectionHandle ?? product.collection_handle ?? product.product_type ?? ''),
    price: typeof product.price === 'number' ? product.price : Number(product.price ?? 0),
    images,
    image_url: imageUrl,
    image: typeof product.image === 'string' ? product.image : undefined,
    tags: toStringArray(product.tags),
    description: String(product.description ?? ''),
    inventory_qty: typeof product.inventory_qty === 'number' ? product.inventory_qty : null,
    created_at: typeof product.created_at === 'string' ? product.created_at : undefined,
    status: typeof product.status === 'string' ? product.status : undefined,
  };
};

const normalizeProducts = (products: ProductRecord[]) => products.map(normalizeProduct);

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

const buildLocalProducts = (): ShopProduct[] =>
  LOCAL_COLLECTIONS.flatMap((collection, collectionIndex) => {
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
        const image = getProductImagePath(collection.handle, item);

        return {
          id: `static-${handle}`,
          handle,
          name: item,
          sku: `${collection.handle.slice(0, 3).toUpperCase()}-${String(itemIndex + 1).padStart(3, '0')}`,
          product_type: collection.title,
          collectionHandle: collection.handle,
          price,
          images: [image],
          image_url: image,
          tags: [collection.handle, collection.title, item, itemSlug],
          description: `${item} for ${collection.title.toLowerCase()}.`,
          inventory_qty,
        };
      });
  });

const LOCAL_PRODUCTS = buildLocalProducts();

const getDbProducts = async (): Promise<ShopProduct[]> => {
  const { data, error } = await supabase
    .from('ecom_products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return normalizeProducts(data as ProductRecord[]);
};

const matchesQuery = (product: ShopProduct, query: ProductQuery) => {
  const search = query.q?.trim().toLowerCase();
  const handle = query.handle?.trim().toLowerCase();
  const collectionHandle = query.collectionHandle?.trim().toLowerCase();
  const ids = query.ids?.map(String);

  if (ids && ids.length > 0 && !ids.includes(String(product.id))) {
    return false;
  }

  if (handle && product.handle.toLowerCase() !== handle) {
    return false;
  }

  if (collectionHandle) {
    const normalizedCollection = normalizeShopTag(collectionHandle);
    const matchesCollection =
      normalizeShopTag(product.collectionHandle) === normalizedCollection ||
      normalizeShopTag(product.product_type) === normalizedCollection ||
      product.tags.some((tag) => normalizeShopTag(tag) === normalizedCollection);

    if (!matchesCollection) {
      return false;
    }
  }

  if (search) {
    const haystack = [product.name, product.handle, product.product_type, product.collectionHandle, ...product.tags]
      .map((value) => normalizeShopTag(String(value)))
      .join(' ');

    if (!haystack.includes(search)) {
      return false;
    }
  }

  return true;
};

const applyQuery = (products: ShopProduct[], query: ProductQuery = {}) => {
  let result = products.filter((product) => matchesQuery(product, query));

  if (query.limit) {
    result = result.slice(0, query.limit);
  }

  return result;
};

async function resolveProducts(): Promise<ShopProduct[]> {
  if (SOURCE_MODE === 'local') {
    return LOCAL_PRODUCTS;
  }

  const dbProducts = await getDbProducts();
  return dbProducts.length > 0 ? dbProducts : LOCAL_PRODUCTS;
}

export async function getProducts(query: ProductQuery = {}) {
  return applyQuery(await resolveProducts(), query);
}

export async function getProductByHandle(handle: string) {
  const products = await getProducts({ handle });
  return products[0] || null;
}

export async function getProductsForCollectionHandle(handle: string) {
  return getProducts({ collectionHandle: handle });
}

export async function searchProducts(q: string, limit = 50) {
  return getProducts({ q, limit });
}

export async function getProductsByIds(ids: string[]) {
  return getProducts({ ids });
}
