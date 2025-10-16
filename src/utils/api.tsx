import { projectId as defaultProjectId, publicAnonKey as defaultPublicAnonKey } from './supabase/info';

const EDGE_FUNCTION_SLUG = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION ?? 'make-server-7528fbcc';
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? defaultProjectId;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? defaultPublicAnonKey;
const apiBaseOverride = import.meta.env.VITE_SUPABASE_EDGE_URL;

const API_BASE_URL = apiBaseOverride ?? `https://${projectId}.supabase.co/functions/v1/${EDGE_FUNCTION_SLUG}`;

const isBrowser = typeof window !== 'undefined';
const isSupabaseConfigured =
  Boolean(projectId && projectId !== 'your-project-id') &&
  Boolean(publicAnonKey && publicAnonKey !== 'your-anon-key');

if (!isSupabaseConfigured) {
  console.info(
    'Brak wypełnionej konfiguracji Supabase – aplikacja użyje zapisu w przeglądarce jako trybu demo.'
  );
}

export interface CosmeticProduct {
  id: string;
  name: string;
  brand: string;
  type: string;
  openedDate: string;
  expiryDate: string;
  status: 'fresh' | 'warning' | 'expired';
  createdAt?: string;
}

export interface RoutineStep {
  id: string;
  day: string; // monday, tuesday, etc.
  timeOfDay: 'morning' | 'evening';
  productIds: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveIngredient {
  name: string;
  type: 'acid' | 'retinoid' | 'vitamin-c' | 'niacinamide' | 'other';
  frequency: 'daily' | 'every-other-day' | '2-3-times-week' | 'weekly';
  cannotCombineWith: string[];
  description: string;
}

const LOCAL_PRODUCTS_KEY = 'skincare-calendar.products';
const LOCAL_ROUTINES_KEY = 'skincare-calendar.routines';

const calculateStatus = (expiryDate: string): CosmeticProduct['status'] => {
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

const readLocal = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Nie udało się odczytać ${key} z localStorage`, error);
    return fallback;
  }
};

const writeLocal = <T,>(key: string, value: T) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Nie udało się zapisać ${key} w localStorage`, error);
  }
};

const sampleProducts: CosmeticProduct[] = [
  {
    id: 'product:demo-vitamin-c',
    name: 'Serum z witaminą C 15%',
    brand: 'Beauty of Joseon',
    type: 'Serum',
    openedDate: new Date('2024-07-01').toISOString(),
    expiryDate: new Date('2025-01-01').toISOString(),
    status: 'fresh',
    createdAt: new Date('2024-07-01').toISOString(),
  },
  {
    id: 'product:demo-retinol',
    name: 'Retinol 0.2% w skwalanie',
    brand: 'The Ordinary',
    type: 'Serum',
    openedDate: new Date('2024-05-15').toISOString(),
    expiryDate: new Date('2024-11-15').toISOString(),
    status: 'warning',
    createdAt: new Date('2024-05-15').toISOString(),
  },
];

const sampleRoutines: RoutineStep[] = [
  {
    id: 'routine:demo:monday:morning',
    day: 'monday',
    timeOfDay: 'morning',
    productIds: ['product:demo-vitamin-c'],
    notes: 'Nałóż na suchą skórę, potem krem z filtrem.',
    createdAt: new Date('2024-07-02').toISOString(),
  },
  {
    id: 'routine:demo:tuesday:evening',
    day: 'tuesday',
    timeOfDay: 'evening',
    productIds: ['product:demo-retinol'],
    notes: 'Stosuj co drugi wieczór. Dodaj krem nawilżający.',
    createdAt: new Date('2024-07-02').toISOString(),
  },
];

const ensureDefaults = () => {
  if (!isBrowser) return;
  if (!window.localStorage.getItem(LOCAL_PRODUCTS_KEY)) {
    writeLocal(LOCAL_PRODUCTS_KEY, sampleProducts);
  }
  if (!window.localStorage.getItem(LOCAL_ROUTINES_KEY)) {
    writeLocal(LOCAL_ROUTINES_KEY, sampleRoutines);
  }
};

const getLocalProducts = () => {
  ensureDefaults();
  return readLocal<CosmeticProduct[]>(LOCAL_PRODUCTS_KEY, sampleProducts);
};

const saveLocalProducts = (products: CosmeticProduct[]) => {
  writeLocal(LOCAL_PRODUCTS_KEY, products);
};

const createProductLocally = (
  product: Omit<CosmeticProduct, 'id' | 'createdAt' | 'status'>
): CosmeticProduct => {
  const products = getLocalProducts();
  const newProduct: CosmeticProduct = {
    ...product,
    id: generateId('product'),
    createdAt: new Date().toISOString(),
    status: calculateStatus(product.expiryDate),
  };
  saveLocalProducts([...products, newProduct]);
  return newProduct;
};

const deleteProductLocally = (id: string) => {
  const products = getLocalProducts().filter((product) => product.id !== id);
  saveLocalProducts(products);
};

const getLocalRoutines = () => {
  ensureDefaults();
  return readLocal<RoutineStep[]>(LOCAL_ROUTINES_KEY, sampleRoutines);
};

const saveLocalRoutines = (routines: RoutineStep[]) => {
  writeLocal(LOCAL_ROUTINES_KEY, routines);
};

const createRoutineLocally = (
  routine: Omit<RoutineStep, 'id' | 'createdAt' | 'updatedAt'>
): RoutineStep => {
  const routines = getLocalRoutines();
  const newRoutine: RoutineStep = {
    ...routine,
    id: generateId('routine'),
    createdAt: new Date().toISOString(),
  };
  saveLocalRoutines([...routines, newRoutine]);
  return newRoutine;
};

const updateRoutineLocally = (
  id: string,
  routine: Partial<RoutineStep>
): RoutineStep => {
  const routines = getLocalRoutines();
  const existing = routines.find((item) => item.id === id);
  const updatedRoutine: RoutineStep = {
    ...(existing ?? {
      id,
      day: routine.day ?? 'monday',
      timeOfDay: routine.timeOfDay ?? 'morning',
      productIds: routine.productIds ?? [],
    }),
    ...routine,
    id,
    updatedAt: new Date().toISOString(),
  };
  const nextRoutines = routines.filter((item) => item.id !== id);
  nextRoutines.push(updatedRoutine);
  saveLocalRoutines(nextRoutines);
  return updatedRoutine;
};

const deleteRoutineLocally = (id: string) => {
  const routines = getLocalRoutines().filter((routine) => routine.id !== id);
  saveLocalRoutines(routines);
};

const generateId = (prefix: 'product' | 'routine') => {
  const unique =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Date.now().toString(36);
  return `${prefix}:${unique}`;
};

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!isSupabaseConfigured) {
      throw new Error('SUPABASE_NOT_CONFIGURED');
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private fallbackToLocal<T>(action: () => T, reason: unknown) {
    console.warn('Używam danych lokalnych – szczegóły:', reason);
    return action();
  }

  async getProducts(): Promise<CosmeticProduct[]> {
    if (!isSupabaseConfigured) {
      return getLocalProducts();
    }

    try {
      const data = await this.request<{ products: CosmeticProduct[] }>('/products');
      return data.products.map((product) => ({
        ...product,
        openedDate:
          typeof product.openedDate === 'string' ? product.openedDate : String(product.openedDate),
        expiryDate:
          typeof product.expiryDate === 'string' ? product.expiryDate : String(product.expiryDate),
        status: product.status ?? calculateStatus(String(product.expiryDate)),
      }));
    } catch (error) {
      return this.fallbackToLocal(() => getLocalProducts(), error);
    }
  }

  async createProduct(
    product: Omit<CosmeticProduct, 'id' | 'createdAt' | 'status'>
  ): Promise<CosmeticProduct> {
    if (!isSupabaseConfigured) {
      return createProductLocally(product);
    }

    try {
      const data = await this.request<{ product: CosmeticProduct }>('/products', {
        method: 'POST',
        body: JSON.stringify({ product }),
      });
      return data.product;
    } catch (error) {
      return this.fallbackToLocal(() => createProductLocally(product), error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      deleteProductLocally(id);
      return;
    }

    try {
      await this.request<{ success: boolean }>(`/products/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      this.fallbackToLocal(() => {
        deleteProductLocally(id);
      }, error);
    }
  }

  async searchProductByBarcode(barcode: string): Promise<any> {
    if (!isSupabaseConfigured) {
      const suffix = barcode.slice(-6) || '000000';
      return {
        name: `Produkt demo ${suffix}`,
        brand: 'Demo marka',
        type: 'Krem do twarzy',
        barcode,
      };
    }

    try {
      const data = await this.request<{ product: any }>(`/products/barcode/${barcode}`);
      return data.product;
    } catch (error) {
      return this.fallbackToLocal(
        () => ({
          name: `Produkt demo ${barcode.slice(-6) || '000000'}`,
          brand: 'Demo marka',
          type: 'Krem do twarzy',
          barcode,
        }),
        error
      );
    }
  }

  async getRoutines(): Promise<RoutineStep[]> {
    if (!isSupabaseConfigured) {
      return getLocalRoutines();
    }

    try {
      const data = await this.request<{ routines: RoutineStep[] }>('/routines');
      return data.routines;
    } catch (error) {
      return this.fallbackToLocal(() => getLocalRoutines(), error);
    }
  }

  async createRoutine(
    routine: Omit<RoutineStep, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RoutineStep> {
    if (!isSupabaseConfigured) {
      return createRoutineLocally(routine);
    }

    try {
      const data = await this.request<{ routine: RoutineStep }>('/routines', {
        method: 'POST',
        body: JSON.stringify({ routine }),
      });
      return data.routine;
    } catch (error) {
      return this.fallbackToLocal(() => createRoutineLocally(routine), error);
    }
  }

  async updateRoutine(id: string, routine: Partial<RoutineStep>): Promise<RoutineStep> {
    if (!isSupabaseConfigured) {
      return updateRoutineLocally(id, routine);
    }

    try {
      const data = await this.request<{ routine: RoutineStep }>(`/routines/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ routine }),
      });
      return data.routine;
    } catch (error) {
      return this.fallbackToLocal(() => updateRoutineLocally(id, routine), error);
    }
  }

  async deleteRoutine(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      deleteRoutineLocally(id);
      return;
    }

    try {
      await this.request<{ success: boolean }>(`/routines/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      this.fallbackToLocal(() => {
        deleteRoutineLocally(id);
      }, error);
    }
  }
}

export const apiClient = new ApiClient();
