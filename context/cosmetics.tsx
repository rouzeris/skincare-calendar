import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RoutineConfig } from "@/context/routine";
import { deleteProductImage } from "@/utils/product-image";

export type Frequency =
  | { type: "daily" }
  | { type: "interval"; days: number } // Every X days
  | { type: "weekly"; daysOfWeek: number[] }; // 0=Sun, 1=Mon, etc.

export type Product = {
  id: string;
  name: string;
  brand: string;
  openedAt?: string; // ISO Date
  endDate?: string; // ISO schedule end date
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
      const removed = current.find((product) => product.id === productId);
      const updated = current.filter((p) => p.id !== productId);
      const storedConfig = await AsyncStorage.getItem("routine_config");
      const currentConfig: RoutineConfig = storedConfig
        ? (JSON.parse(storedConfig) as RoutineConfig)
        : { morning: [], evening: [] };
      const routineConfig = {
        morning: currentConfig.morning.filter((id) => id !== productId),
        evening: currentConfig.evening.filter((id) => id !== productId),
      };

      await AsyncStorage.multiSet([
        [STORAGE_KEY, JSON.stringify(updated)],
        ["routine_config", JSON.stringify(routineConfig)],
      ]);
      deleteProductImage(removed?.image);
      return { products: updated, routineConfig };
    },
    onSuccess: ({ products, routineConfig }) => {
      queryClient.setQueryData(["cosmetics"], products);
      queryClient.setQueryData(["routineConfig"], routineConfig);
    },
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    addProduct: addMutation.mutate,
    removeProduct: removeMutation.mutate,
  };
});
