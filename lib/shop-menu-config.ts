/*
 * shop-menu-config.ts
 * This file defines the configuration for the shop menu, including the categories and their corresponding items.
 * Each category has a title, a handle (used for routing), and a list of items that belong to that category.
 * This configuration is used throughout the shop-related components to display the menu and organize products.
 */

const SHOP_MENU = [
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

export default SHOP_MENU;
