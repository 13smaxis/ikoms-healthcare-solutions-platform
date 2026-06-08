const CATEGORY_CAROUSEL_HANDLES = [
  'clinical-supplies',
  'diagnostic-equipment',
  'emergency-first-aid',
  'healthcare-technology',
  'home-care-patient-support',
  'ppe-safety-equipment',
  'training-educational-supplies',
];

const CATEGORY_CAROUSEL_DEFAULT_FILES = [
  'alcohol-swabs.png',
  'catheters.png',
  'face-masks.png',
  'gauze-bandages.png',
  'medical-tape.png',
  'syringes.png',
  'wound-dressings.png',
];

const CATEGORY_CAROUSEL_FILES_BY_HANDLE: Record<string, string[]> = {
  'clinical-supplies': [
    'alcohol-swabs.png',
    'face-masks.png',
    'gauze-bandages.png',
    'medical-tape.png',
    'surgical-gloves.png',
    'syringes.png',
    'wound-dressings.png',
  ],
};

const CATEGORY_CAROUSEL_IMAGES: Record<string, string[]> =
  CATEGORY_CAROUSEL_HANDLES.reduce((acc, handle) => {
    const files = CATEGORY_CAROUSEL_FILES_BY_HANDLE[handle] || CATEGORY_CAROUSEL_DEFAULT_FILES;
    acc[handle] = files.map(
      (fileName) => `/images/${handle}/carousel/${fileName}`
    );
    return acc;
  }, {} as Record<string, string[]>);

export function getCategoryCarouselImages(handle: string) {
  return CATEGORY_CAROUSEL_IMAGES[handle] || [];
}
