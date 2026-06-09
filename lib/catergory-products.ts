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
  model?: string;
  key_features?: string[];
  medical_information?: string;
  inventory_qty: number | null;
  created_at?: string;
  status?: string;
};

export const normalizeShopTag = (value?: string | string[]) => {
  const safeValue = Array.isArray(value) ? value[0] ?? '' : value ?? '';
  return safeValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

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
    model: 'AS-100-STER',
    key_features: [
      'Individually wrapped sterile swab',
      '70% isopropyl alcohol antiseptic',
      'Latex-free and breathable',
      'Ready to use for wound cleaning',
    ],
    medical_information:
      'Use for skin cleansing before injections, blood draws, and wound dressing changes. Dispose after single use. Keep away from flame.',
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
    model: 'SG-250-PF',
    key_features: [
      'Powder-free sterile design',
      'High tactile sensitivity',
      'Latex-free for allergy-safe use',
      'Textured grip for secure handling',
    ],
    medical_information:
      'Single-use gloves for surgical procedures and clinical examinations. Designed for barrier protection against contaminants. Discard after use.',
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
    model: 'MT-1.25-ROLL',
    key_features: [
      'Hypoallergenic adhesive',
      'Easy tearable for quick application',
      'Breathable and flexible',
      'Securely holds dressings in place',
    ],
    medical_information:
      'Ideal for securing wound dressings, catheters, and tubing. Remove gently to avoid skin irritation. Suitable for sensitive skin.',
    inventory_qty: 31,
    status: 'active',
  },
    {
    id: 'clinical-004',
    handle: 'catheters',
    name: 'Catheters',
    sku: 'CT-230',
    product_type: 'Instruments',
    collectionHandle: 'clinical-supplies',
    price: 1499,
    images: ['/images/clinical-supplies/catheters.png'],
    tags: ['sterile', 'urology', 'disposable'],
    description: 'Sterile, single-use catheters designed for reliable patient care and easy insertion.',
    model: 'CT-CH10-STER',
    key_features: [
      'Sterile single-use catheter',
      'Smooth silicone surface',
      'Flexible yet stable design',
      'Easy insertion with clear markings',
    ],
    medical_information:
      'Use for short-term urinary catheterisation under clinical supervision. Single-use product. Follow standard hygiene protocols and discard safely after use.',
    inventory_qty: 26,
    status: 'active',
  },
  {
    id: 'clinical-005',
    handle: 'face-masks',
    name: 'Face Masks',
    sku: 'FM-200',
    product_type: 'PPE',
    collectionHandle: 'clinical-supplies',
    price: 699,
    images: ['/images/clinical-supplies/face-masks.png'],
    tags: ['respiratory protection', 'surgical', 'disposable'],
    description: 'Three-layer surgical masks for reliable respiratory protection and comfortable all-day wear.',
    model: 'FM-200-PRO',
    key_features: [
      'Three-layer barrier protection',
      'Breathable fit for all-day comfort',
      'Latex-free and hypoallergenic',
      'Secure ear loops for stable fit',
    ],
    medical_information:
      'Suitable for general clinical use and patient care activities. Replace after each use and dispose safely.',
    inventory_qty: 62,
    status: 'active',
  },
  {
    id: 'clinical-006',
    handle: 'disposable-aprons',
    name: 'Disposable Aprons',
    sku: 'DA-180',
    product_type: 'Protective Wear',
    collectionHandle: 'clinical-supplies',
    price: 1299,
    images: ['/images/clinical-supplies/disposable-aprons.png'],
    tags: ['waterproof', 'single use', 'hygiene'],
    description: 'Lightweight disposable aprons to protect staff and surfaces during clinical procedures.',
    model: 'DA-180-WP',
    key_features: [
      'Waterproof protection',
      'Lightweight and durable material',
      'Easy-wrap fastening',
      'Single-use hygiene barrier',
    ],
    medical_information:
      'Use during patient care and clinical procedures to protect clothing and maintain hygiene. Dispose after use.',
    inventory_qty: 40,
    status: 'active',
  },
  {
    id: 'clinical-007',
    handle: 'gauze-bandages',
    name: 'Gauze Bandages',
    sku: 'GB-150',
    product_type: 'Wound Care',
    collectionHandle: 'clinical-supplies',
    price: 899,
    images: ['/images/clinical-supplies/gauze-bandages.png'],
    tags: ['absorbent', 'sterile', 'bandage'],
    description: 'Sterile gauze bandages for wound dressing and secure support in clinical settings.',
    model: 'GB-150-STER',
    key_features: [
      'Sterile gauze material',
      'High absorbency',
      'Soft and breathable',
      'Ideal for wound dressing',
    ],
    medical_information:
      'Use for wound coverage, support, and absorption. Change regularly to maintain cleanliness and healing.',
    inventory_qty: 54,
    status: 'active',
  },
  {
    id: 'clinical-008',
    handle: 'iv-cannulas',
    name: 'IV Cannulas',
    sku: 'IV-24G',
    product_type: 'Infusion',
    collectionHandle: 'clinical-supplies',
    price: 1199,
    images: ['/images/clinical-supplies/iv-cannulas.png'],
    tags: ['intravenous', 'single use', 'sterile'],
    description: 'High-quality IV cannulas for safe and precise venous access during fluid therapy.',
    model: 'IV-24G-STER',
    key_features: [
      'Smooth flexible tubing',
      'Colour-coded gauge',
      'Sterile single-use design',
      'Secure insertion hub',
    ],
    medical_information:
      'Intended for intravenous access and fluid administration. Use under clinical supervision and dispose after single use.',
    inventory_qty: 38,
    status: 'active',
  },
  {
    id: 'clinical-009',
    handle: 'syringes',
    name: 'Syringes',
    sku: 'SY-10ML',
    product_type: 'Disposables',
    collectionHandle: 'clinical-supplies',
    price: 499,
    images: ['/images/clinical-supplies/syringes.png'],
    tags: ['injection', 'single use', 'sterile'],
    description: 'Sterile syringes for injections and medication delivery with clear volume markings.',
    model: 'SY-10ML-CLN',
    key_features: [
      'Clear volume graduations',
      'Sterile single-use construction',
      'Smooth plunger action',
      'Leak-resistant seal',
    ],
    medical_information:
      'Suitable for medication delivery and clinical injections. Use with compatible needles and dispose after use.',
    inventory_qty: 74,
    status: 'active',
  },
  {
    id: 'clinical-010',
    handle: 'wound-dressings',
    name: 'Wound Dressings',
    sku: 'WD-250',
    product_type: 'Wound Care',
    collectionHandle: 'clinical-supplies',
    price: 1299,
    images: ['/images/clinical-supplies/wound-dressings.png'],
    tags: ['absorbent', 'protective', 'healing'],
    description: 'Advanced wound dressings for protection, absorption, and accelerated healing.',
    model: 'WD-250-ADV',
    key_features: [
      'Soft absorbent pad',
      'Flexible adhesive backing',
      'Breathable protective cover',
      'Suitable for moderate wounds',
    ],
    medical_information:
      'Use to protect injured areas, absorb exudate, and support wound healing. Change as needed according to clinical guidelines.',
    inventory_qty: 45,
    status: 'active',
  },
  {
    id: 'diagnostic-001',
    handle: 'blood-pressure-monitor',
    name: 'Blood Pressure Monitor',
    sku: 'BP-210',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 5499,
    images: ['/images/diagnostic-equipment/blood-pressure-meter.jpg'],
    tags: ['blood pressure', 'monitoring', 'portable'],
    description: 'Accurate digital blood pressure monitor for daily screening and clinical checks.',
    inventory_qty: 22,
    status: 'active',
    key_features: [
      'Fast inflation with clear LED display',
      'Memory recall for up to 99 readings',
      'Cuff fits most adults',
      'Portable clinical-grade design',
    ],
    medical_information:
      'Use on the upper arm for precise blood pressure readings. Follow the included instructions for cuff placement and proper measurement technique.',
  },
  {
    id: 'diagnostic-002',
    handle: 'pulse-oximeter',
    name: 'Pulse Oximeter',
    sku: 'PO-330',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 3299,
    images: ['/images/diagnostic-equipment/finger-pulse-oximeter.jpg'],
    tags: ['oxygen saturation', 'SpO2', 'portable'],
    description: 'Compact fingertip pulse oximeter for quick SpO2 and pulse measurement.',
    inventory_qty: 16,
    status: 'active',
    key_features: [
      'Large OLED display for easy reading',
      'Automatic power-off after inactivity',
      'Suitable for adults and paediatric use',
      'Lightweight clinical monitoring tool',
    ],
    medical_information:
      'Designed for spot-check monitoring of oxygen saturation and pulse rate. Use on a clean finger and keep batteries fresh for accurate readings.',
  },
  {
    id: 'diagnostic-003',
    handle: '12-channel-ecg-machine',
    name: '12-Channel ECG Machine',
    sku: 'ECG-1212',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 21999,
    images: ['/images/diagnostic-equipment/twelve-channel-ecg.jpg'],
    tags: ['ecg', 'cardiac monitoring', 'clinical'],
    description: 'Full-featured 12-channel ECG machine for advanced cardiac diagnostics.',
    inventory_qty: 6,
    status: 'active',
    key_features: [
      'Clear waveform display with recording capability',
      'Compact design for clinic and ward use',
      'Auto-interpretation software included',
      'High-fidelity signal acquisition',
    ],
    medical_information:
      'Use in clinical environments for electrocardiogram assessment and cardiac monitoring. Ensure electrodes are placed correctly and interpret results with trained personnel.',
  },
  {
    id: 'diagnostic-004',
    handle: 'handheld-ultrasound-scanner',
    name: 'Handheld Ultrasound Scanner',
    sku: 'US-560',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 42999,
    images: ['/images/diagnostic-equipment/handheld-ultrasound-scanner.jpg'],
    tags: ['ultrasound', 'portable', 'imaging'],
    description: 'Portable handheld ultrasound scanner for rapid bedside imaging and diagnostics.',
    inventory_qty: 9,
    status: 'active',
    key_features: [
      'High-resolution imaging in a compact form',
      'Battery-powered for field use',
      'Multiple probe modes for versatile scanning',
      'Intuitive touch screen controls',
    ],
    medical_information:
      'Designed for quick imaging assessments in emergency and outpatient settings. Use with approved ultrasound gel and follow manufacturer safety guidelines.',
  },
  {
    id: 'diagnostic-005',
    handle: 'laptop-ultrasound-system',
    name: 'Laptop Ultrasound System',
    sku: 'US-780',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 62999,
    images: ['/images/diagnostic-equipment/kx5000-laptop-ultrasound.jpg'],
    tags: ['ultrasound', 'diagnostic imaging', 'clinical'],
    description: 'Full-featured laptop ultrasound system for diagnostic imaging in clinics and hospitals.',
    inventory_qty: 5,
    status: 'active',
    key_features: [
      'Large laptop display with advanced imaging modes',
      'Portable but powerful diagnostic system',
      'Supports multiple transducers',
      'Clinical-grade image processing',
    ],
    medical_information:
      'Used for abdominal, vascular, and obstetric imaging. Operate only by trained staff and perform routine probe care between patients.',
  },
  {
    id: 'diagnostic-006',
    handle: 'contec-ecg-1212g',
    name: 'Contec ECG 1212G',
    sku: 'ECG-1212G',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 24999,
    images: ['/images/diagnostic-equipment/contec-egc-1212g.jpg'],
    tags: ['ecg', 'cardiac', 'clinical'],
    description: 'High-performance Contec ECG 1212G for accurate cardiac monitoring and reporting.',
    inventory_qty: 10,
    status: 'active',
    key_features: [
      '12-lead ECG recording',
      'Integrated report printing',
      'Compact clinical design',
      'Easy electrode placement',
    ],
    medical_information:
      'Use in clinical settings for comprehensive cardiac rhythm analysis. Follow device calibration and electrode placement procedures.',
  },
  {
    id: 'diagnostic-007',
    handle: 'lsp100-lung-function-machine',
    name: 'Contec SP100 Lung Function Machine',
    sku: 'LF-100',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 35999,
    images: ['/images/diagnostic-equipment/contec-sp100-lung-function-machine.jpg'],
    tags: ['spirometry', 'lung function', 'respiratory'],
    description: 'Portable lung function machine for spirometry testing and respiratory assessment.',
    inventory_qty: 8,
    status: 'active',
    key_features: [
      'Fast pulmonary function tests',
      'Compact portable unit',
      'Clear digital results',
      'Measures FVC, FEV1, and flow values',
    ],
    medical_information:
      'Designed for respiratory clinics and screening. Use under supervision and calibrate before patient testing.',
  },
  {
    id: 'diagnostic-008',
    handle: 'rossmax-sb200-pulse-oximeter',
    name: 'Rossmax SB200 Pulse Oximeter',
    sku: 'PO-200',
    product_type: 'Diagnostics',
    collectionHandle: 'diagnostic-equipment',
    price: 2799,
    images: ['/images/diagnostic-equipment/rossmax-sb200-pulse-oximeter.jpg'],
    tags: ['oxygen', 'pulse', 'portable'],
    description: 'Rossmax SB200 pulse oximeter for quick and reliable oxygen saturation measurements.',
    inventory_qty: 14,
    status: 'active',
    key_features: [
      'Large dual-color display',
      'Fast SpO2 and pulse results',
      'Compact fingertip design',
      'Suitable for home and clinical use',
    ],
    medical_information:
      'Use on clean fingers for spot-check monitoring of oxygen saturation. Replace batteries as needed for consistent readings.',
  },
  {
    id: 'emergency-001',
    handle: 'first-aid-kit',
    name: 'First Aid Kit',
    sku: 'FA-100',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 2699,
    images: ['/images/emergency-first-aid/first-aid-kit.jpg'],
    tags: ['bandages', 'emergency', 'kit'],
    description: 'Ready-to-use first aid kit with bandages, disinfectants, and emergency essentials.',
    inventory_qty: 27,
    status: 'active',
    key_features: [
      'Waterproof casing for outdoor use',
      'Comprehensive wound care supplies',
      'Easy to carry and store',
      'Includes antiseptic wipes and dressings',
    ],
    medical_information:
      'Ideal for workplace and home emergency response. Check contents regularly and replace used items promptly.',
  },
  {
    id: 'emergency-002',
    handle: 'first-aid-mini-kit',
    name: 'First Aid Mini Kit',
    sku: 'FA-110',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 1499,
    images: ['/images/emergency-first-aid/first-aid-mini-kit.jpg'],
    tags: ['travel', 'compact', 'emergency'],
    description: 'Compact mini kit for travel, car, and personal emergency preparedness.',
    inventory_qty: 34,
    status: 'active',
    key_features: [
      'Small, lightweight and portable',
      'Basic bandages and antiseptics included',
      'Ideal for first response care',
      'Fits in backpacks and glove compartments',
    ],
    medical_information:
      'Use for minor cuts, scrapes, and fast response situations. Replace supplies after each use to maintain readiness.',
  },
  {
    id: 'emergency-003',
    handle: 'cpr-pocket-resuscitator',
    name: 'CPR Pocket Resuscitator',
    sku: 'CPR-210',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 3999,
    images: ['/images/emergency-first-aid/cpr-pocket-resuscitator.jpg'],
    tags: ['cpr', 'resuscitation', 'emergency'],
    description: 'Compact pocket resuscitator for safe ventilation during CPR and first response.',
    inventory_qty: 18,
    status: 'active',
    key_features: [
      'One-way valve for hygiene',
      'Lightweight and portable',
      'Clear mask for easy placement',
      'Durable emergency response tool',
    ],
    medical_information:
      'Use only during CPR and assisted ventilation. Follow standard resuscitation protocols and replace after patient use.',
  },
  {
    id: 'emergency-004',
    handle: 'burn-gel-tube',
    name: 'Burn Gel Tube',
    sku: 'BG-305',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 999,
    images: ['/images/emergency-first-aid/burn-gel-tube.jpg'],
    tags: ['burn care', 'cooling', 'emergency'],
    description: 'Cooling burn gel for quick first aid treatment of minor burns and scalds.',
    inventory_qty: 41,
    status: 'active',
    key_features: [
      'Soothing formula for burn relief',
      'Easy-squeeze tube dispenser',
      'Non-greasy and fast absorbing',
      'Safe for minor burn first aid',
    ],
    medical_information:
      'Apply gently over affected area and cover with sterile dressing if needed. Seek medical attention for serious burns.',
  },
  {
    id: 'emergency-005',
    handle: 'hydrogen-peroxide',
    name: 'Hydrogen Peroxide',
    sku: 'HP-100',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 849,
    images: ['/images/emergency-first-aid/hydrogen-peroxide.jpg'],
    tags: ['disinfectant', 'wound care', 'first aid'],
    description: 'Antiseptic hydrogen peroxide for wound cleansing and first aid preparation.',
    inventory_qty: 29,
    status: 'active',
    key_features: [
      'Effective wound cleansing',
      'Sterile first aid essential',
      'Easy pour bottle design',
      'Ideal for emergency kits',
    ],
    medical_information:
      'Use in small amounts to clean wounds and prevent infection. Do not ingest and store away from heat.',
  },
  {
    id: 'emergency-006',
    handle: 'betadine-antiseptic',
    name: 'Betadine Antiseptic',
    sku: 'BA-200',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 1199,
    images: ['/images/emergency-first-aid/betadine.jpg'],
    tags: ['antiseptic', 'wound care', 'disinfectant'],
    description: 'Betadine antiseptic solution for effective wound cleansing and infection prevention.',
    inventory_qty: 35,
    status: 'active',
    key_features: [
      'Broad-spectrum antiseptic activity',
      'Easy-to-use bottle',
      'Suitable for cuts and abrasions',
      'Trusted first aid staple',
    ],
    medical_information:
      'Use to cleanse minor wounds and help reduce the risk of infection. Avoid contact with eyes and mucous membranes.',
  },
  {
    id: 'emergency-007',
    handle: 'blue-nitrile-gloves',
    name: 'Blue Nitrile Gloves',
    sku: 'NG-300',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 1399,
    images: ['/images/emergency-first-aid/blue-nitrile-gloves.jpg'],
    tags: ['gloves', 'protective', 'disposable'],
    description: 'Durable blue nitrile gloves for safe handling during first aid and emergency response.',
    inventory_qty: 50,
    status: 'active',
    key_features: [
      'Latex-free nitrile material',
      'Textured grip for secure handling',
      'Powder-free for sensitive skin',
      'Single-use hygiene protection',
    ],
    medical_information:
      'Use during wound care, CPR, and emergency treatment to protect both caregiver and patient. Dispose after single use.',
  },
  {
    id: 'emergency-008',
    handle: 'burncare-dressing',
    name: 'BurnCare Dressing',
    sku: 'BC-150',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 1699,
    images: ['/images/emergency-first-aid/burncare.jpg'],
    tags: ['burn care', 'dressing', 'cooling'],
    description: 'BurnCare dressing for soothing relief and protective coverage of minor burns.',
    inventory_qty: 20,
    status: 'active',
    key_features: [
      'Cooling hydrogel formula',
      'Non-adherent dressing surface',
      'Easy application and removal',
      'Supports burn first aid',
    ],
    medical_information:
      'Apply to minor burns and cover with sterile dressing if needed. Seek medical advice for more severe injuries.',
  },
  {
    id: 'emergency-009',
    handle: 'cancare-gauze-pad',
    name: 'CanCare Gauze Pad',
    sku: 'GP-120',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 899,
    images: ['/images/emergency-first-aid/cancare-gauzepad.jpg'],
    tags: ['gauze', 'wound care', 'absorbent'],
    description: 'Sterile CanCare gauze pad for wound coverage and absorption during first aid.',
    inventory_qty: 42,
    status: 'active',
    key_features: [
      'High absorbency',
      'Soft sterile material',
      'Ideal for cuts and abrasions',
      'Convenient single-use pad',
    ],
    medical_information:
      'Use as part of wound dressing to absorb fluids and protect injured skin. Replace regularly to maintain hygiene.',
  },
  {
    id: 'emergency-010',
    handle: 'cpr-mouthpiece',
    name: 'CPR Mouthpiece',
    sku: 'CPR-305',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 1599,
    images: ['/images/emergency-first-aid/cpr-mouthpiece.jpg'],
    tags: ['cpr', 'resuscitation', 'safety'],
    description: 'CPR mouthpiece for safe barrier protection during rescue breathing.',
    inventory_qty: 25,
    status: 'active',
    key_features: [
      'One-way valve protection',
      'Compact and portable',
      'Clear mouth shield design',
      'Reusable with cleaning between uses',
    ],
    medical_information:
      'Use when performing rescue breathing during CPR to reduce exposure to bodily fluids. Clean or replace after each use.',
  },
  {
    id: 'emergency-011',
    handle: 'elasto-plaster',
    name: 'Elasto Plaster',
    sku: 'EP-220',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 799,
    images: ['/images/emergency-first-aid/elasto-plaster.jpg'],
    tags: ['bandage', 'plaster', 'elastic'],
    description: 'Stretchable Elasto plaster for secure wound coverage with comfortable movement.',
    inventory_qty: 30,
    status: 'active',
    key_features: [
      'Elastic stretch for joint movement',
      'Strong adhesive hold',
      'Breathable material',
      'Ideal for minor cuts and blisters',
    ],
    medical_information:
      'Use on minor wounds to keep dressings in place without restricting motion. Replace when soiled or loose.',
  },
  {
    id: 'emergency-012',
    handle: 'sterile-dressing-tray',
    name: 'Healthease Sterile Dressing Tray',
    sku: 'DT-450',
    product_type: 'Emergency',
    collectionHandle: 'emergency-first-aid',
    price: 2499,
    images: ['/images/emergency-first-aid/healthease-sterile-dressing-tray.jpg'],
    tags: ['sterile', 'dressing', 'tray'],
    description: 'Sterile dressing tray with essential supplies for safe wound care and emergency dressing changes.',
    inventory_qty: 18,
    status: 'active',
    key_features: [
      'Pre-packed sterile dressing supplies',
      'Easy to use in emergencies',
      'Compact tray for quick access',
      'Designed for clinical first aid',
    ],
    medical_information:
      'Use to perform sterile dressing changes in first aid and emergency settings. Replace tray contents after use.',
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

export function getProductByHandle(handle: string | string[] | undefined) {
  if (!handle || (Array.isArray(handle) && handle.length === 0)) return null;
  const normalizedHandle = normalizeShopTag(handle);
  return SHOP_PRODUCTS.find((product) => normalizeShopTag(product.handle) === normalizedHandle) ?? null;
}

/*
 * Gets products for a given collection handle.
 * Normalizes the handle to ensure consistent matching against product collection handles.
 * Filters the SHOP_PRODUCTS array to find products that belong to the specified collection.
 * Returns an array of products that match the collection handle.
 */
export function getProductsForCollectionHandle(handle: string | string[] | undefined) {
  if (!handle || (Array.isArray(handle) && handle.length === 0)) return [];                                     //-If handle is not provided or empty, returns an empty array
  const normalizedHandle = normalizeShopTag(handle);
  return SHOP_PRODUCTS.filter((product) => normalizeShopTag(product.collectionHandle) === normalizedHandle);
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
