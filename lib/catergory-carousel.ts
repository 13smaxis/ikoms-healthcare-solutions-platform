const CATEGORY_CAROUSEL_HANDLES = [
  'clinical-supplies',
  'diagnostic-equipment',
  'emergency-first-aid',
  'healthcare-technology',
  'home-care-patient-support',
  'hospital-clinic-furniture',
  'ppe-safety-equipment',
  'training-educational-supplies',
];

const CATEGORY_CAROUSEL_FILES = [
  'alcohol-swabs.png',
  'catheters.png',
  'disposable-aprons.png',
  'face-masks.png',
  'gauze-bandages.png',
  'iv-cannulas.png',
  'medical-tape.png',
  'surgical-gloves.png',
  'syringes.png',
  'wound-dressings.png',
];

const CATEGORY_CAROUSEL_IMAGES: Record<string, string[]> =
  CATEGORY_CAROUSEL_HANDLES.reduce((acc, handle) => {
    acc[handle] = CATEGORY_CAROUSEL_FILES.map(
      (fileName) => `/images/${handle}/carousel/${fileName}`
    );
    return acc;
  }, {} as Record<string, string[]>);

export function getCategoryCarouselImages(handle: string) {
  return CATEGORY_CAROUSEL_IMAGES[handle] || [];
}
