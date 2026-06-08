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
    '/images/diagnostic-equipment/marquee/rossmax-sb200-pulse-oximeter.jpg',
    '/images/diagnostic-equipment/marquee/twelve-channel-ecg.jpg',
  ],
  'emergency-first-aid': [
    '/images/emergency-first-aid/marquee/shears-scissors-hemostats.jpg',
    '/images/emergency-first-aid/marquee/sterile-sergical-gloves.jpg',
  ],
};

export function getCategoryMarqueeImages(handle: string) {
  return CATEGORY_MARQUEE_IMAGES[handle] || [];
}
