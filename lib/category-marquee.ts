const CATEGORY_MARQUEE_IMAGES: Record<string, string[]> = {
  'clinical-supplies': [
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
  'diagnostic-equipment': [
    '/images/diagnostic-equipment/marquee/alcohol-swabs.jpg',
    '/images/diagnostic-equipment/marquee/catheters.jpg',
    '/images/diagnostic-equipment/marquee/disposable-aprons.jpg',
    '/images/diagnostic-equipment/marquee/face-masks.jpg',
    '/images/diagnostic-equipment/marquee/gauze-bandages.jpg',
    '/images/diagnostic-equipment/marquee/iv-cannulas.jpg',
    '/images/diagnostic-equipment/marquee/medical-tape.jpg',
    '/images/diagnostic-equipment/marquee/surgical-gloves.jpg',
    '/images/diagnostic-equipment/marquee/syringes.jpg',
    '/images/diagnostic-equipment/marquee/wound-dressings.jpg',
  ],
};

export function getCategoryMarqueeImages(handle: string) {
  return CATEGORY_MARQUEE_IMAGES[handle] || [];
}