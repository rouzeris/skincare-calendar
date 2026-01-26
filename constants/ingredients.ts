export type IngredientCompatibility = {
  name: string;
  goodWith: string[];
  avoidWith: string[];
  description: string;
};

export const INGREDIENT_COMPATIBILITY: IngredientCompatibility[] = [
  {
    name: 'Retinol / Retinoids',
    goodWith: ['Hyaluronic Acid', 'Niacinamide', 'Peptides', 'Ceramides'],
    avoidWith: ['Vitamin C', 'AHA/BHA', 'Benzoyl Peroxide'],
    description: 'Anti-aging powerhouse. Use at night, start slowly.'
  },
  {
    name: 'Vitamin C',
    goodWith: ['Vitamin E', 'Ferulic Acid', 'Hyaluronic Acid', 'SPF'],
    avoidWith: ['Retinol', 'Niacinamide', 'AHA/BHA', 'Benzoyl Peroxide'],
    description: 'Brightening antioxidant. Best used in the morning.'
  },
  {
    name: 'Niacinamide',
    goodWith: ['Hyaluronic Acid', 'Retinol', 'Peptides', 'Ceramides', 'SPF'],
    avoidWith: ['Vitamin C (high concentrations)'],
    description: 'Versatile ingredient for pores, oil control, and barrier.'
  },
  {
    name: 'AHA (Glycolic, Lactic)',
    goodWith: ['Hyaluronic Acid', 'Niacinamide', 'Ceramides'],
    avoidWith: ['Retinol', 'Vitamin C', 'BHA', 'Benzoyl Peroxide'],
    description: 'Chemical exfoliant for surface texture. Use SPF after.'
  },
  {
    name: 'BHA (Salicylic Acid)',
    goodWith: ['Hyaluronic Acid', 'Niacinamide', 'Ceramides'],
    avoidWith: ['Retinol', 'AHA', 'Vitamin C', 'Benzoyl Peroxide'],
    description: 'Oil-soluble exfoliant for pores and acne.'
  },
  {
    name: 'Hyaluronic Acid',
    goodWith: ['Everything!', 'Retinol', 'Vitamin C', 'Niacinamide', 'AHA/BHA'],
    avoidWith: [],
    description: 'Hydrating ingredient that pairs well with most actives.'
  },
  {
    name: 'Benzoyl Peroxide',
    goodWith: ['Hyaluronic Acid', 'Niacinamide'],
    avoidWith: ['Retinol', 'Vitamin C', 'AHA/BHA'],
    description: 'Acne-fighting ingredient. Can bleach fabrics.'
  },
  {
    name: 'Peptides',
    goodWith: ['Hyaluronic Acid', 'Niacinamide', 'Retinol', 'Vitamin C'],
    avoidWith: ['AHA/BHA (direct mixing)'],
    description: 'Anti-aging building blocks for skin proteins.'
  },
  {
    name: 'Azelaic Acid',
    goodWith: ['Niacinamide', 'Hyaluronic Acid', 'Retinol', 'Vitamin C'],
    avoidWith: [],
    description: 'Gentle acid for redness, acne, and hyperpigmentation.'
  },
  {
    name: 'Ceramides',
    goodWith: ['Everything!', 'Retinol', 'AHA/BHA', 'Niacinamide'],
    avoidWith: [],
    description: 'Barrier-repairing lipids. Great for sensitive skin.'
  }
];

export const GENERAL_TIPS = [
  'Apply actives from thinnest to thickest consistency',
  'Wait 1-2 minutes between active layers',
  'Introduce new actives slowly (2-3x per week)',
  'Always use SPF when using AHA, BHA, or Retinol',
  'If irritation occurs, simplify your routine'
];
