import { UserConstraints } from '../types';

export const EQUIPMENT_OPTIONS = [
  'Pilates mat',
  'Water bottles (light hand weights)',
  'Two ~8lb gallon milk jugs',
  'Treadmill',
  'Stationary cycle machine',
  'Gym access',
  'Resistance bands',
  'Full dumbbell set',
  'Yoga blocks',
  'Jump rope',
];

export const DEFAULT_CONSTRAINTS: UserConstraints = {
  cookingAppliances: {
    stovetop: true,
    microwave: true,
    oven: false,
    airFryer: false,
  },
  equipment: [
    'Pilates mat',
    'Water bottles (light hand weights)',
    'Two ~8lb gallon milk jugs',
    'Treadmill',
    'Stationary cycle machine',
  ],
  dietaryNotes:
    'Loves dairy (yogurt, cheese, milk). Eats eggs, ham (pre-cooked/sliced), frozen patties, avocado. Willing to cook raw chicken on stovetop. Does not eat whole fruit but drinks fruit juices. Focus on low GI, anti-inflammatory, PCOS-appropriate nutrition.',
};
