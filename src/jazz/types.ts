import { co, z, type SyncConfig } from 'jazz-tools';

export type ProductStatus = 'fresh' | 'warning' | 'expired';

export interface CosmeticProduct {
  id: string;
  name: string;
  brand: string;
  type: string;
  openedDate: string;
  expiryDate: string;
  status: ProductStatus;
  createdAt: string;
}

export interface RoutineStep {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  timeOfDay: 'morning' | 'evening';
  productIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActiveIngredient {
  name: string;
  type: 'acid' | 'retinoid' | 'vitamin-c' | 'niacinamide' | 'other';
  frequency: 'daily' | 'every-other-day' | '2-3-times-week' | 'weekly';
  cannotCombineWith: string[];
  description: string;
}

export const calculateStatus = (expiryDate: string): ProductStatus => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));

  if (Number.isNaN(days)) {
    return 'fresh';
  }

  if (days < 0) return 'expired';
  if (days <= 30) return 'warning';
  return 'fresh';
};

const createIsoDate = (date: string) => new Date(date).toISOString();

const buildProduct = (
  product: Omit<CosmeticProduct, 'createdAt' | 'status'> & { createdAt?: string }
): CosmeticProduct => {
  const createdAt = product.createdAt ?? new Date().toISOString();
  return {
    ...product,
    createdAt,
    status: calculateStatus(product.expiryDate),
  };
};

export const demoProducts: CosmeticProduct[] = [
  buildProduct({
    id: 'product:demo-vitamin-c',
    name: 'Serum z witaminą C 15%',
    brand: 'Beauty of Joseon',
    type: 'Serum',
    openedDate: createIsoDate('2024-07-01'),
    expiryDate: createIsoDate('2025-01-01'),
    createdAt: createIsoDate('2024-07-01'),
  }),
  buildProduct({
    id: 'product:demo-retinol',
    name: 'Retinol 0.2% w skwalanie',
    brand: 'The Ordinary',
    type: 'Serum',
    openedDate: createIsoDate('2024-05-15'),
    expiryDate: createIsoDate('2024-11-15'),
    createdAt: createIsoDate('2024-05-15'),
  }),
];

export const demoRoutines: RoutineStep[] = [
  {
    id: 'routine:demo:monday:morning',
    day: 'monday',
    timeOfDay: 'morning',
    productIds: ['product:demo-vitamin-c'],
    notes: 'Nałóż na suchą skórę, potem krem z filtrem.',
    createdAt: createIsoDate('2024-07-02'),
  },
  {
    id: 'routine:demo:tuesday:evening',
    day: 'tuesday',
    timeOfDay: 'evening',
    productIds: ['product:demo-retinol'],
    notes: 'Stosuj co drugi wieczór. Dodaj krem nawilżający.',
    createdAt: createIsoDate('2024-07-02'),
  },
];

const createId = (prefix: 'product' | 'routine') => {
  const unique =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}:${unique}`;
};

export const generateProductId = () => createId('product');
export const generateRoutineId = () => createId('routine');

export const buildSyncConfig = (apiKey?: string | null): SyncConfig => {
  if (apiKey) {
    return {
      peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
    };
  }

  return {
    when: 'never',
  };
};

export const CosmeticProductSchema = co.map({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  type: z.string(),
  openedDate: z.string(),
  expiryDate: z.string(),
  status: z.enum(['fresh', 'warning', 'expired']),
  createdAt: z.string(),
});

export const RoutineStepSchema = co.map({
  id: z.string(),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  timeOfDay: z.enum(['morning', 'evening']),
  productIds: co.list(z.string()),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
