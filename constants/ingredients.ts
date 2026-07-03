export type IngredientCompatibility = {
  name: string;
  keywords: string[];
  goodWith: string[];
  avoidWith: string[];
  description: string;
};

export type ConflictRule = {
  ingredientA: string;
  ingredientB: string;
  severity: "high" | "medium";
  reason: string;
  shortWarning: string;
};

export const INGREDIENT_COMPATIBILITY: IngredientCompatibility[] = [
  {
    name: "Retinol / Retinoids",
    keywords: [
      "retinol",
      "retinoid",
      "retin-a",
      "tretinoin",
      "adapalene",
      "differin",
      "retinal",
      "bakuchiol",
    ],
    goodWith: ["Hyaluronic Acid", "Niacinamide", "Peptides", "Ceramides"],
    avoidWith: ["Vitamin C", "AHA/BHA", "Benzoyl Peroxide"],
    description: "Anti-aging powerhouse. Use at night, start slowly.",
  },
  {
    name: "Vitamin C",
    keywords: [
      "vitamin c",
      "ascorbic acid",
      "l-ascorbic",
      "ascorbyl",
      "tetrahexyldecyl ascorbate",
      "ethylated ascorbic",
    ],
    goodWith: ["Vitamin E", "Ferulic Acid", "Hyaluronic Acid", "SPF"],
    avoidWith: ["Retinol", "Niacinamide", "AHA/BHA", "Benzoyl Peroxide"],
    description: "Brightening antioxidant. Best used in the morning.",
  },
  {
    name: "Niacinamide",
    keywords: ["niacinamide", "nicotinamide", "vitamin b3"],
    goodWith: ["Hyaluronic Acid", "Retinol", "Peptides", "Ceramides", "SPF"],
    avoidWith: ["Vitamin C (high concentrations)"],
    description: "Versatile ingredient for pores, oil control, and barrier.",
  },
  {
    name: "AHA (Glycolic, Lactic)",
    keywords: ["aha", "glycolic", "lactic acid", "mandelic", "alpha hydroxy"],
    goodWith: ["Hyaluronic Acid", "Niacinamide", "Ceramides"],
    avoidWith: ["Retinol", "Vitamin C", "BHA", "Benzoyl Peroxide"],
    description: "Chemical exfoliant for surface texture. Use SPF after.",
  },
  {
    name: "BHA (Salicylic Acid)",
    keywords: ["bha", "salicylic", "beta hydroxy"],
    goodWith: ["Hyaluronic Acid", "Niacinamide", "Ceramides"],
    avoidWith: ["Retinol", "AHA", "Vitamin C", "Benzoyl Peroxide"],
    description: "Oil-soluble exfoliant for pores and acne.",
  },
  {
    name: "Hyaluronic Acid",
    keywords: ["hyaluronic", "sodium hyaluronate", "ha"],
    goodWith: ["Everything!", "Retinol", "Vitamin C", "Niacinamide", "AHA/BHA"],
    avoidWith: [],
    description: "Hydrating ingredient that pairs well with most actives.",
  },
  {
    name: "Benzoyl Peroxide",
    keywords: ["benzoyl peroxide", "bp"],
    goodWith: ["Hyaluronic Acid", "Niacinamide"],
    avoidWith: ["Retinol", "Vitamin C", "AHA/BHA"],
    description: "Acne-fighting ingredient. Can bleach fabrics.",
  },
  {
    name: "Peptides",
    keywords: ["peptide", "matrixyl", "argireline", "copper peptide", "buffet"],
    goodWith: ["Hyaluronic Acid", "Niacinamide", "Retinol", "Vitamin C"],
    avoidWith: ["AHA/BHA (direct mixing)"],
    description: "Anti-aging building blocks for skin proteins.",
  },
  {
    name: "Azelaic Acid",
    keywords: ["azelaic"],
    goodWith: ["Niacinamide", "Hyaluronic Acid", "Retinol", "Vitamin C"],
    avoidWith: [],
    description: "Gentle acid for redness, acne, and hyperpigmentation.",
  },
  {
    name: "Ceramides",
    keywords: ["ceramide", "phytosphingosine", "sphingolipid"],
    goodWith: ["Everything!", "Retinol", "AHA/BHA", "Niacinamide"],
    avoidWith: [],
    description: "Barrier-repairing lipids. Great for sensitive skin.",
  },
];

export const CONFLICT_RULES: ConflictRule[] = [
  {
    ingredientA: "Retinol / Retinoids",
    ingredientB: "Vitamin C",
    severity: "high",
    shortWarning: "Retinol + Vitamin C",
    reason:
      "Both are potent actives that can cause irritation, redness, and peeling when used together. Retinol works best at a higher pH while Vitamin C needs a low pH. Use Vitamin C in the morning and Retinol at night.",
  },
  {
    ingredientA: "Retinol / Retinoids",
    ingredientB: "AHA (Glycolic, Lactic)",
    severity: "high",
    shortWarning: "Retinol + AHA",
    reason:
      "Combining retinol with AHA exfoliants significantly increases the risk of irritation, dryness, and compromised skin barrier. Use on alternate nights or different days.",
  },
  {
    ingredientA: "Retinol / Retinoids",
    ingredientB: "BHA (Salicylic Acid)",
    severity: "high",
    shortWarning: "Retinol + BHA",
    reason:
      "Both increase skin sensitivity and cell turnover. Using together can lead to excessive dryness, peeling, and irritation. Alternate their use on different nights.",
  },
  {
    ingredientA: "Retinol / Retinoids",
    ingredientB: "Benzoyl Peroxide",
    severity: "high",
    shortWarning: "Retinol + Benzoyl Peroxide",
    reason:
      "Benzoyl peroxide can oxidize and deactivate retinol, making both less effective. They also cause significant dryness together. Use at different times of day.",
  },
  {
    ingredientA: "Vitamin C",
    ingredientB: "AHA (Glycolic, Lactic)",
    severity: "medium",
    shortWarning: "Vitamin C + AHA",
    reason:
      "Both are acidic and can over-exfoliate the skin when layered. This may cause redness and sensitivity. Apply Vitamin C in the morning and AHA in the evening.",
  },
  {
    ingredientA: "Vitamin C",
    ingredientB: "BHA (Salicylic Acid)",
    severity: "medium",
    shortWarning: "Vitamin C + BHA",
    reason:
      "Layering these acids can disrupt pH levels and reduce effectiveness of both. Use at different times — Vitamin C in the AM, BHA in the PM.",
  },
  {
    ingredientA: "Vitamin C",
    ingredientB: "Benzoyl Peroxide",
    severity: "high",
    shortWarning: "Vitamin C + Benzoyl Peroxide",
    reason:
      "Benzoyl peroxide oxidizes Vitamin C, rendering it ineffective. Never apply them at the same time. Use Vitamin C in the morning and BP in the evening.",
  },
  {
    ingredientA: "Vitamin C",
    ingredientB: "Niacinamide",
    severity: "medium",
    shortWarning: "Vitamin C + Niacinamide",
    reason:
      "In high concentrations they can reduce each other's effectiveness and cause flushing. Modern formulations are often fine together, but if you notice redness, apply at different times.",
  },
  {
    ingredientA: "AHA (Glycolic, Lactic)",
    ingredientB: "BHA (Salicylic Acid)",
    severity: "medium",
    shortWarning: "AHA + BHA",
    reason:
      "Double exfoliation can damage the skin barrier, leading to dryness, redness, and increased sensitivity. Alternate between them on different days.",
  },
  {
    ingredientA: "AHA (Glycolic, Lactic)",
    ingredientB: "Benzoyl Peroxide",
    severity: "medium",
    shortWarning: "AHA + Benzoyl Peroxide",
    reason:
      "Both can be drying and irritating. Using them together increases risk of over-drying and damaging your skin barrier. Use on alternate days.",
  },
  {
    ingredientA: "BHA (Salicylic Acid)",
    ingredientB: "Benzoyl Peroxide",
    severity: "medium",
    shortWarning: "BHA + Benzoyl Peroxide",
    reason:
      "Both target acne but together they cause excessive dryness. Some dermatologists recommend alternating — BHA in the morning, BP at night, or on different days.",
  },
  {
    ingredientA: "Peptides",
    ingredientB: "AHA (Glycolic, Lactic)",
    severity: "medium",
    shortWarning: "Peptides + AHA",
    reason:
      "Acids can break down peptide bonds, reducing their anti-aging benefits. Apply peptides first, let absorb, or use at different times of day.",
  },
  {
    ingredientA: "Peptides",
    ingredientB: "BHA (Salicylic Acid)",
    severity: "medium",
    shortWarning: "Peptides + BHA",
    reason:
      "The acidic pH of BHA can degrade peptides. Use BHA first and wait 20 minutes, or use them at different times of day.",
  },
];

export const GENERAL_TIPS = [
  "Apply actives from thinnest to thickest consistency",
  "Wait 1-2 minutes between active layers",
  "Introduce new actives slowly (2-3x per week)",
  "Always use SPF when using AHA, BHA, or Retinol",
  "If irritation occurs, simplify your routine",
];

export function detectIngredients(productName: string): string[] {
  const nameLower = productName.toLowerCase();
  const detected: string[] = [];

  for (const ingredient of INGREDIENT_COMPATIBILITY) {
    for (const keyword of ingredient.keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        if (!detected.includes(ingredient.name)) {
          detected.push(ingredient.name);
        }
        break;
      }
    }
  }

  return detected;
}

export type DetectedConflict = {
  productA: { id: string; name: string; brand: string };
  productB: { id: string; name: string; brand: string };
  ingredientA: string;
  ingredientB: string;
  severity: "high" | "medium";
  reason: string;
  shortWarning: string;
};

export function detectConflicts(
  products: Array<{ id: string; name: string; brand: string }>,
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  const productIngredients = products.map((p) => ({
    ...p,
    ingredients: detectIngredients(p.name),
  }));

  for (let i = 0; i < productIngredients.length; i++) {
    for (let j = i + 1; j < productIngredients.length; j++) {
      const pA = productIngredients[i];
      const pB = productIngredients[j];

      for (const ingA of pA.ingredients) {
        for (const ingB of pB.ingredients) {
          const rule = CONFLICT_RULES.find(
            (r) =>
              (r.ingredientA === ingA && r.ingredientB === ingB) ||
              (r.ingredientA === ingB && r.ingredientB === ingA),
          );

          if (rule) {
            const alreadyExists = conflicts.some(
              (c) =>
                c.shortWarning === rule.shortWarning &&
                ((c.productA.id === pA.id && c.productB.id === pB.id) ||
                  (c.productA.id === pB.id && c.productB.id === pA.id)),
            );

            if (!alreadyExists) {
              conflicts.push({
                productA: { id: pA.id, name: pA.name, brand: pA.brand },
                productB: { id: pB.id, name: pB.name, brand: pB.brand },
                ingredientA: ingA,
                ingredientB: ingB,
                severity: rule.severity,
                reason: rule.reason,
                shortWarning: rule.shortWarning,
              });
            }
          }
        }
      }
    }
  }

  conflicts.sort((a, b) => {
    if (a.severity === "high" && b.severity !== "high") return -1;
    if (a.severity !== "high" && b.severity === "high") return 1;
    return 0;
  });

  return conflicts;
}
