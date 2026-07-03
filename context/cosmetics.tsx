import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Frequency =
  | { type: "daily" }
  | { type: "interval"; days: number } // Every X days
  | { type: "weekly"; daysOfWeek: number[] }; // 0=Sun, 1=Mon, etc.

export type Product = {
  id: string;
  name: string;
  brand: string;
  openedAt?: string; // ISO Date
  periodAfterOpening?: number; // months
  expirationDate?: string; // ISO Date
  category?: string;
  image?: string;
  frequency?: Frequency;
};

const STORAGE_KEY = "cosmetics_shelf";

export const [CosmeticsProvider, useCosmetics] = createContextHook(() => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cosmetics"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Product[]) : [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newProduct: Product) => {
      const current = query.data || [];
      const updated = [...current, newProduct];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["cosmetics"], updated);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const current = query.data || [];
      const updated = current.filter((p) => p.id !== productId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["cosmetics"], updated);
    },
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    addProduct: addMutation.mutate,
    removeProduct: removeMutation.mutate,
  };
});
