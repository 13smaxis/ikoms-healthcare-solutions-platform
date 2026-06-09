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
    '/images/diagnostic-equipment/marquee/drager.jpg',
    '/images/diagnostic-equipment/marquee/ge-healthcare.jpg',
    '/images/diagnostic-equipment/marquee/mindray.jpg',
    '/images/diagnostic-equipment/marquee/omron.jpg',
    '/images/diagnostic-equipment/marquee/phillips-healthcare.jpg',
    '/images/diagnostic-equipment/marquee/roche.jpg',
    '/images/diagnostic-equipment/marquee/siemens-healthineers.jpg',
    '/images/diagnostic-equipment/marquee/welchallyn.jpg',
  ],
  'emergency-first-aid': [
    '/images/emergency-first-aid/marquee/band-aid.jpg',
    '/images/emergency-first-aid/marquee/burnshield-products-logo.jpg',
    '/images/emergency-first-aid/marquee/disposable-aprons.jpg',
    '/images/emergency-first-aid/marquee/face-masks.jpg',
    '/images/emergency-first-aid/marquee/gauze-bandages.jpg',
    '/images/emergency-first-aid/marquee/logo-symbol-vector-outline-illlustration.jpg',
    '/images/emergency-first-aid/marquee/mindray.jpg',
    '/images/emergency-first-aid/marquee/omron.jpg',
  ],
  'ppe-safety-equipment': [
    '/images/ppe-safety-equipment/marquee/3M.jpg',
    '/images/ppe-safety-equipment/marquee/ansell.jpg',
    '/images/ppe-safety-equipment/marquee/catheters.jpg',
    '/images/ppe-safety-equipment/marquee/disposable-aprons.jpg',
    '/images/ppe-safety-equipment/marquee/gauze-bandages.jpg',
    '/images/ppe-safety-equipment/marquee/surgical-gloves.jpg',
  ],
  'training-educational-supplies': [
    '/images/training-educational-supplies/marquee/american-red-cross.jpg',
    '/images/training-educational-supplies/marquee/elsvier.jpg',
    '/images/training-educational-supplies/marquee/international-stroke-conference.jpg',
    '/images/training-educational-supplies/marquee/laerdal.jpg',
  ],
  'home-care-patient-support': [
    '/images/home-care-patient-support/marquee/ansell.jpg',
    '/images/home-care-patient-support/marquee/arjo.jpg',
    '/images/home-care-patient-support/marquee/hillrom.jpg',
    '/images/home-care-patient-support/marquee/invacare.jpg',
    '/images/home-care-patient-support/marquee/stryker.jpg',
  ],
};

export function getCategoryMarqueeImages(handle: string) {
  return CATEGORY_MARQUEE_IMAGES[handle] || [];
}
