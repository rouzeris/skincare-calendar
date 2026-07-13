import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteProductImage, persistProductImage } from "@/utils/product-image";

export type Frequency =
  | { type: "daily" }
  | { type: "interval"; days: number }
  | { type: "weekly"; daysOfWeek: number[] };

export type Product = {
  id: string;
  name: string;
  brand: string;
  openedAt?: string;
  endDate?: string;
  periodAfterOpening?: number;
  expirationDate?: string;
  category?: string;
  image?: string;
  frequency?: Frequency;
};

export type TimeOfDay = "morning" | "evening";

export type RoutineConfig = {
  morning: string[];
  evening: string[];
};

export type RoutineHistory = Record<
  string,
  { morning: string[]; evening: string[] }
>;

export const localDataKeys = {
  cosmetics: "cosmetics_shelf",
  routineConfig: "routine_config",
  routineHistory: "routine_history",
} as const;

export const localDataQueryKeys = {
  cosmetics: ["cosmetics"] as const,
  routineConfig: ["routineConfig"] as const,
  routineHistory: ["routineHistory"] as const,
};

const emptyRoutineConfig = (): RoutineConfig => ({ morning: [], evening: [] });

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const stored = await AsyncStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T) : fallback;
}

export const readProducts = () =>
  readJson<Product[]>(localDataKeys.cosmetics, []);

export const readRoutineConfig = () =>
  readJson<RoutineConfig>(localDataKeys.routineConfig, emptyRoutineConfig());

export type CreateProductInput = {
  product: Omit<Product, "id" | "image">;
  imageUri?: string;
  times: TimeOfDay[];
};

export async function createProduct({
  product: productInput,
  imageUri,
  times,
}: CreateProductInput) {
  const id = Math.random().toString(36).slice(2, 11);
  let image: string | undefined;

  try {
    image = imageUri ? persistProductImage(imageUri, id) : undefined;
    const [products, currentConfig] = await Promise.all([
      readProducts(),
      readRoutineConfig(),
    ]);
    const product: Product = { ...productInput, id, image };
    const updatedProducts = [...products, product];
    const routineConfig: RoutineConfig = {
      morning: times.includes("morning")
        ? [...currentConfig.morning, id]
        : currentConfig.morning,
      evening: times.includes("evening")
        ? [...currentConfig.evening, id]
        : currentConfig.evening,
    };

    await AsyncStorage.multiSet([
      [localDataKeys.cosmetics, JSON.stringify(updatedProducts)],
      [localDataKeys.routineConfig, JSON.stringify(routineConfig)],
    ]);
    return { products: updatedProducts, routineConfig };
  } catch (error) {
    deleteProductImage(image);
    throw error;
  }
}

export async function removeProduct(productId: string) {
  const [products, currentConfig] = await Promise.all([
    readProducts(),
    readRoutineConfig(),
  ]);
  const removed = products.find((product) => product.id === productId);
  const updatedProducts = products.filter(
    (product) => product.id !== productId,
  );
  const routineConfig: RoutineConfig = {
    morning: currentConfig.morning.filter((id) => id !== productId),
    evening: currentConfig.evening.filter((id) => id !== productId),
  };

  await AsyncStorage.multiSet([
    [localDataKeys.cosmetics, JSON.stringify(updatedProducts)],
    [localDataKeys.routineConfig, JSON.stringify(routineConfig)],
  ]);
  deleteProductImage(removed?.image);
  return { products: updatedProducts, routineConfig };
}
