import SHOP_MENU from '@/components/shop-menu-config';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getCollectionItemNames = (handle: string) => {
  const normalizedHandle = slugify(handle);
  const collection = SHOP_MENU.find((entry) => slugify(entry.handle) === normalizedHandle);

  return (collection?.items || []).filter((item) => item !== 'Products');
};

const getCollectionItemIndex = (handle: string, productName: string) => {
  const items = getCollectionItemNames(handle);
  const normalizedProductName = slugify(productName);
  const exactMatch = items.findIndex((item) => slugify(item) === normalizedProductName);

  return exactMatch >= 0 ? exactMatch : 0;
};

export type ShopProductMediaSource = {
  name?: string;
  handle?: string;
  collectionHandle?: string;
  product_type?: string;
  images?: string[] | null;
};

export type CollectionMedia = {
  carouselImages: string[];
  marqueeImages: string[];
};

const COLLECTION_PRODUCT_IMAGES: Record<string, string[]> = {
  'clinical-supplies': [
    '/images/clinical-supplies/alcohol-swabs.png',
    '/images/clinical-supplies/catheters.png',
    '/images/clinical-supplies/disposable-aprons.png',
    '/images/clinical-supplies/face-masks.png',
    '/images/clinical-supplies/gauze-bandages.png',
    '/images/clinical-supplies/iv-cannulas.png',
    '/images/clinical-supplies/medical-tape.png',
    '/images/clinical-supplies/surgical-gloves.png',
    '/images/clinical-supplies/syringes.png',
    '/images/clinical-supplies/wound-dressings.png',
  ],
  'ppe-safety-equipment': [
    '/images/ppe-safety-equipment/alcohol-swabs.jpg',
    '/images/ppe-safety-equipment/catheters.jpg',
    '/images/ppe-safety-equipment/disposable-aprons.jpg',
    '/images/ppe-safety-equipment/face-masks.jpg',
    '/images/ppe-safety-equipment/gauze-bandages.jpg',
    '/images/ppe-safety-equipment/iv-cannulas.jpg',
    '/images/ppe-safety-equipment/medical-tape.jpg',
    '/images/ppe-safety-equipment/surgical-gloves.jpg',
    '/images/ppe-safety-equipment/syringes.jpg',
  ],
  'diagnostic-equipment': [
    '/images/diagnostic-equipment/alcohol-swabs.jpg',
    '/images/diagnostic-equipment/catheters.jpg',
    '/images/diagnostic-equipment/disposable-aprons.jpg',
    '/images/diagnostic-equipment/face-masks.jpg',
    '/images/diagnostic-equipment/gauze-bandages.jpg',
    '/images/diagnostic-equipment/iv-cannulas.jpg',
    '/images/diagnostic-equipment/medical-tape.jpg',
    '/images/diagnostic-equipment/surgical-gloves.jpg',
    '/images/diagnostic-equipment/syringes.jpg',
  ],
  'hospital-clinic-furniture': [
    '/images/hospital-clinic-furniture/alcohol-swabs.jpg',
    '/images/hospital-clinic-furniture/catheters.jpg',
    '/images/hospital-clinic-furniture/disposable-aprons.jpg',
    '/images/hospital-clinic-furniture/face-masks.jpg',
    '/images/hospital-clinic-furniture/gauze-bandages.jpg',
    '/images/hospital-clinic-furniture/iv-cannulas.jpg',
    '/images/hospital-clinic-furniture/medical-tape.jpg',
    '/images/hospital-clinic-furniture/surgical-gloves.jpg',
    '/images/hospital-clinic-furniture/syringes.jpg',
  ],
  'training-educational-supplies': [
    '/images/training-educational-supplies/alcohol-swabs.jpg',
    '/images/training-educational-supplies/catheters.jpg',
    '/images/training-educational-supplies/disposable-aprons.jpg',
    '/images/training-educational-supplies/face-masks.jpg',
    '/images/training-educational-supplies/gauze-bandages.jpg',
    '/images/training-educational-supplies/iv-cannulas.jpg',
    '/images/training-educational-supplies/medical-tape.jpg',
    '/images/training-educational-supplies/surgical-gloves.jpg',
    '/images/training-educational-supplies/syringes.jpg',
  ],
  'home-care-patient-support': [
    '/images/home-care-patient-support/alcohol-swabs.jpg',
    '/images/home-care-patient-support/catheters.jpg',
    '/images/home-care-patient-support/disposable-aprons.jpg',
    '/images/home-care-patient-support/face-masks.jpg',
    '/images/home-care-patient-support/gauze-bandages.jpg',
    '/images/home-care-patient-support/iv-cannulas.jpg',
    '/images/home-care-patient-support/medical-tape.jpg',
    '/images/home-care-patient-support/surgical-gloves.jpg',
    '/images/home-care-patient-support/syringes.jpg',
  ],
  'emergency-first-aid': [
    '/images/emergency-first-aid/alcohol-swabs.jpg',
    '/images/emergency-first-aid/catheters.jpg',
    '/images/emergency-first-aid/disposable-aprons.jpg',
    '/images/emergency-first-aid/face-masks.jpg',
    '/images/emergency-first-aid/gauze-bandages.jpg',
    '/images/emergency-first-aid/iv-cannulas.jpg',
    '/images/emergency-first-aid/medical-tape.jpg',
    '/images/emergency-first-aid/surgical-gloves.jpg',
    '/images/emergency-first-aid/syringes.jpg',
  ],
  'healthcare-technology': [
    '/images/healthcare-technology/alcohol-swabs.jpg',
    '/images/healthcare-technology/catheters.jpg',
    '/images/healthcare-technology/disposable-aprons.jpg',
    '/images/healthcare-technology/face-masks.jpg',
    '/images/healthcare-technology/gauze-bandages.jpg',
    '/images/healthcare-technology/iv-cannulas.jpg',
    '/images/healthcare-technology/medical-tape.jpg',
    '/images/healthcare-technology/surgical-gloves.jpg',
    '/images/healthcare-technology/syringes.jpg',
  ],
};

const COLLECTION_MEDIA_OVERRIDES: Record<string, CollectionMedia> = {
  'clinical-supplies': {
    carouselImages: [
      '/images/clinical-supplies/carousel/alcohol-swabs.png',
      '/images/clinical-supplies/carousel/face-masks.png',
      '/images/clinical-supplies/carousel/gauze-bandages.png',
      '/images/clinical-supplies/carousel/medical-tape.png',
      '/images/clinical-supplies/carousel/surgical-gloves.png',
      '/images/clinical-supplies/carousel/syringes.png',
      '/images/clinical-supplies/carousel/wound-dressings.png',
    ],
    marqueeImages: [
      '/images/clinical-supplies/marquee/alcohol-swabs.jpg',
      '/images/clinical-supplies/marquee/catheters.jpg',
      '/images/clinical-supplies/marquee/disposable-aprons.jpg',
      '/images/clinical-supplies/marquee/face-masks.jpg',
      '/images/clinical-supplies/marquee/gauze-bandages.jpg',
      '/images/clinical-supplies/marquee/iv-cannulas.jpg',
      '/images/clinical-supplies/marquee/medical-tape.jpg',
      '/images/clinical-supplies/marquee/surgical-gloves.jpg',
      '/images/clinical-supplies/marquee/syringes.jpg',
      '/images/clinical-supplies/marquee/wound-dressings.jpg',
    ],
  },
};

export const getProductImagePath = (collectionHandle: string, productName: string, itemIndex = 0) => {
  const collection = slugify(collectionHandle);
  const images = COLLECTION_PRODUCT_IMAGES[collection];

  if (images && images.length > 0) {
    return images[itemIndex % images.length];
  }

  return '';
};

export const resolveShopProductImage = (product: ShopProductMediaSource) => {
  const collectionHandle = product.collectionHandle || product.product_type || '';
  const productName = product.name || product.handle || '';

  if (collectionHandle && productName) {
    const itemIndex = getCollectionItemIndex(collectionHandle, productName);
    return getProductImagePath(collectionHandle, productName, itemIndex);
  }

  return product.images?.[0] || '';
};

export const getCollectionMedia = (handle: string): CollectionMedia => {
  const normalizedHandle = slugify(handle);
  const override = COLLECTION_MEDIA_OVERRIDES[normalizedHandle];

  if (override) {
    return override;
  }

  const itemNames = getCollectionItemNames(normalizedHandle);
  const carouselNames = itemNames.slice(0, 4);
  const marqueeNames = itemNames.slice(4, 10);

  return {
    carouselImages: carouselNames.map((name) => `/images/${normalizedHandle}/carousel/${slugify(name)}.png`),
    marqueeImages: (marqueeNames.length > 0 ? marqueeNames : carouselNames).map(
      (name) => `/images/${normalizedHandle}/${slugify(name)}.jpg`,
    ),
  };
};
