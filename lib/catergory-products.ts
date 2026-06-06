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

export const normalizeShopTag = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

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

const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'clinical-001',
    handle: 'alcohol-swabs',
    name: 'Alcohol Swabs',
    sku: 'AS-100',
    product_type: 'Disposables',
    collectionHandle: 'clinical-supplies',
    price: 420,
    images: ['/images/clinical-supplies/alcohol-swabs.png'],
    tags: ['sterile', 'wound care', 'prep'],
    description: 'Individually wrapped alcohol swabs for fast, sterile skin prep and wound cleaning.',
    inventory_qty: 48,
    status: 'active',
  },
  {
    id: 'clinical-002',
    handle: 'surgical-gloves',
    name: 'Surgical Gloves',
    sku: 'SG-250',
    product_type: 'PPE',
    collectionHandle: 'clinical-supplies',
    price: 1599,
    images: ['/images/clinical-supplies/surgical-gloves.png'],
    tags: ['latex-free', 'protective gear', 'disposable'],
    description: 'Premium powder-free surgical gloves with a textured grip for reliable handling in clinical settings.',
    inventory_qty: 24,
    status: 'active',
  },
  {
    id: 'clinical-003',
    handle: 'medical-tape',
    name: 'Medical Tape',
    sku: 'MT-120',
    product_type: 'Wound Care',
    collectionHandle: 'clinical-supplies',
    price: 749,
    images: ['/images/clinical-supplies/medical-tape.png'],
    tags: ['adhesive', 'first aid', 'secure'],
    description: 'Hypoallergenic medical tape for secure dressing placement and gentle removal.',
    inventory_qty: 31,
    status: 'active',
  },
  {
    id: 'ppe-001',
    handle: 'face-masks',
    name: 'Surgical Face Masks',
    sku: 'FM-200',
    product_type: 'PPE',
    collectionHandle: 'ppe-safety-equipment',
    price: 699,
    images: ['/images/ppe-safety-equipment/face-masks.jpg'],
    tags: ['respiratory protection', 'surgical', 'disposable'],
    description: 'Three-layer surgical masks for reliable respiratory protection and comfortable all-day wear.',
    inventory_qty: 62,
    status: 'active',
  },
  {
    id: 'ppe-002',
    handle: 'disposable-aprons',
    name: 'Disposable Aprons',
    sku: 'DA-180',
    product_type: 'Protective Wear',
    collectionHandle: 'ppe-safety-equipment',
    price: 1299,
    images: ['/images/ppe-safety-equipment/disposable-aprons.jpg'],
    tags: ['waterproof', 'single use', 'hygiene'],
    description: 'Lightweight disposable aprons to protect staff and surfaces during clinical procedures.',
    inventory_qty: 40,
    status: 'active',
  },
  {
    id: 'diagnostic-001',
    handle: 'thermometer',
    name: 'Digital Thermometer',
    sku: 'DT-450',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 2499,
    images: ['/images/diagnostic-equipment/face-masks.jpg'],
    tags: ['temperature', 'digital', 'rapid'],
    description: 'Fast-read digital thermometer for daily monitoring and patient screening.',
    inventory_qty: 18,
    status: 'active',
  },
  {
    id: 'diagnostic-002',
    handle: 'pulse-oximeter',
    name: 'Pulse Oximeter',
    sku: 'PO-330',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 3299,
    images: ['/images/diagnostic-equipment/surgical-gloves.jpg'],
    tags: ['oxygen', 'monitoring', 'portable'],
    description: 'Compact pulse oximeter for quick SpO2 and heart rate readings at the bedside.',
    inventory_qty: 12,
    status: 'active',
  },
  {
    id: 'emergency-001',
    handle: 'first-aid-kit',
    name: 'First Aid Kit',
    sku: 'FA-100',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 2699,
    images: ['/images/emergency-first-aid/disposable-aprons.jpg'],
    tags: ['bandages', 'emergency', 'kit'],
    description: 'Ready-to-use first aid kit with bandages, disinfectants, and emergency essentials.',
    inventory_qty: 27,
    status: 'active',
  },
  {
    id: 'healthtech-001',
    handle: 'portable-monitor',
    name: 'Portable Patient Monitor',
    sku: 'PM-220',
    product_type: 'Healthcare Tech',
    collectionHandle: 'healthcare-technology',
    price: 12999,
    images: ['/images/healthcare-technology/face-masks.jpg'],
    tags: ['monitoring', 'clinical', 'portable'],
    description: 'Multi-parameter monitor for continuous vital sign tracking in mobile care settings.',
    inventory_qty: 8,
    status: 'active',
  },
  {
    id: 'homecare-001',
    handle: 'support-pillows',
    name: 'Patient Support Pillow',
    sku: 'SP-510',
    product_type: 'Comfort',
    collectionHandle: 'home-care-patient-support',
    price: 3499,
    images: ['/images/home-care-patient-support/face-masks.jpg'],
    tags: ['comfort', 'support', 'home care'],
    description: 'Ergonomic support pillow designed for restful recovery and patient comfort at home.',
    inventory_qty: 19,
    status: 'active',
  },
];

export function getProducts() {
  return SHOP_PRODUCTS;
}

export function getProductByHandle(handle: string) {
  return SHOP_PRODUCTS.find((product) => product.handle === handle) ?? null;
}

export function getProductsForCollectionHandle(handle: string) {
  return SHOP_PRODUCTS.filter((product) => product.collectionHandle === handle);
}

export function searchProducts(q: string, limit = 50) {
  const normalized = q.toLowerCase();
  return SHOP_PRODUCTS.filter((product) => {
    const haystack = [
      product.name,
      product.product_type,
      product.description,
      product.tags.join(' '),
      product.collectionHandle,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  }).slice(0, limit);
}

export function getProductsByIds(ids: string[]) {
  return SHOP_PRODUCTS.filter((product) => ids.includes(product.id));
}
