import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7528fbcc`;

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

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getProducts(): Promise<CosmeticProduct[]> {
    const data = await this.request<{ products: CosmeticProduct[] }>('/products');
    return data.products.map(product => ({
      ...product,
      openedDate: typeof product.openedDate === 'string' ? product.openedDate : product.openedDate,
      expiryDate: typeof product.expiryDate === 'string' ? product.expiryDate : product.expiryDate
    }));
  }

  async createProduct(product: Omit<CosmeticProduct, 'id' | 'createdAt'>): Promise<CosmeticProduct> {
    const data = await this.request<{ product: CosmeticProduct }>('/products', {
      method: 'POST',
      body: JSON.stringify({ product }),
    });
    return data.product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async searchProductByBarcode(barcode: string): Promise<any> {
    const data = await this.request<{ product: any }>(`/products/barcode/${barcode}`);
    return data.product;
  }

  // Routine methods
  async getRoutines(): Promise<RoutineStep[]> {
    const data = await this.request<{ routines: RoutineStep[] }>('/routines');
    return data.routines;
  }

  async createRoutine(routine: Omit<RoutineStep, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoutineStep> {
    const data = await this.request<{ routine: RoutineStep }>('/routines', {
      method: 'POST',
      body: JSON.stringify({ routine }),
    });
    return data.routine;
  }

  async updateRoutine(id: string, routine: Partial<RoutineStep>): Promise<RoutineStep> {
    const data = await this.request<{ routine: RoutineStep }>(`/routines/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ routine }),
    });
    return data.routine;
  }

  async deleteRoutine(id: string): Promise<void> {
    await this.request<{ success: boolean }>(`/routines/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();