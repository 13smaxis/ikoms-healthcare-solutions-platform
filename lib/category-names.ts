export type ShopCategory = {
  title: string;
  handle: string;
};

export const SHOP_CATEGORIES: ShopCategory[] = [
  { title: 'Clinical Supplies', handle: 'clinical-supplies' },
  { title: 'PPE & Safety Equipment', handle: 'ppe-safety-equipment' },
  { title: 'Diagnostic Equipment', handle: 'diagnostic-equipment' },
  { title: 'Training & Education', handle: 'training-educational-supplies' },
  { title: 'Home Care & Patient Support', handle: 'home-care-patient-support' },
  { title: 'Emergency & First Aid', handle: 'emergency-first-aid' },
];

export const getCategoryByHandle = (handle: string) =>
  SHOP_CATEGORIES.find((category) => category.handle === handle);
