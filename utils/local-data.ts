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
  state: "local_data_v1",
  legacyCosmetics: "cosmetics_shelf",
  legacyRoutineConfig: "routine_config",
  routineHistory: "routine_history",
} as const;

export const localDataQueryKeys = {
  cosmetics: ["cosmetics"] as const,
  routineConfig: ["routineConfig"] as const,
  routineHistory: ["routineHistory"] as const,
};

type LocalData = {
  version: 1;
  products: Product[];
  routineConfig: RoutineConfig;
};

const emptyRoutineConfig = (): RoutineConfig => ({ morning: [], evening: [] });
let operations = Promise.resolve();

function serialized<T>(operation: () => Promise<T>): Promise<T> {
  const result = operations.then(operation, operation);
  operations = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function load(): Promise<LocalData> {
  const stored = await AsyncStorage.getItem(localDataKeys.state);
  if (stored) return JSON.parse(stored) as LocalData;

  const [products, routineConfig] = await Promise.all([
    AsyncStorage.getItem(localDataKeys.legacyCosmetics),
    AsyncStorage.getItem(localDataKeys.legacyRoutineConfig),
  ]);
  const migrated: LocalData = {
    version: 1,
    products: products ? (JSON.parse(products) as Product[]) : [],
    routineConfig: routineConfig
      ? (JSON.parse(routineConfig) as RoutineConfig)
      : emptyRoutineConfig(),
  };
  await save(migrated);
  return migrated;
}

const save = (data: LocalData) =>
  AsyncStorage.setItem(localDataKeys.state, JSON.stringify(data));

export const readProducts = () =>
  serialized(async () => (await load()).products);

export const readRoutineConfig = () =>
  serialized(async () => (await load()).routineConfig);

export type CreateProductInput = {
  product: Omit<Product, "id" | "image">;
  imageUri?: string;
  times: TimeOfDay[];
};

export function createProduct({
  product: productInput,
  imageUri,
  times,
}: CreateProductInput) {
  return serialized(async () => {
    const id = Math.random().toString(36).slice(2, 11);
    let image: string | undefined;

    try {
      image = imageUri ? persistProductImage(imageUri, id) : undefined;
      const current = await load();
      const product: Product = { ...productInput, id, image };
      const updated: LocalData = {
        version: 1,
        products: [...current.products, product],
        routineConfig: {
          morning: times.includes("morning")
            ? [...current.routineConfig.morning, id]
            : current.routineConfig.morning,
          evening: times.includes("evening")
            ? [...current.routineConfig.evening, id]
            : current.routineConfig.evening,
        },
      };

      await save(updated);
      return updated;
    } catch (error) {
      deleteProductImage(image);
      throw error;
    }
  });
}

export function removeProduct(productId: string) {
  return serialized(async () => {
    const current = await load();
    const removed = current.products.find(
      (product) => product.id === productId,
    );
    const updated: LocalData = {
      version: 1,
      products: current.products.filter((product) => product.id !== productId),
      routineConfig: {
        morning: current.routineConfig.morning.filter((id) => id !== productId),
        evening: current.routineConfig.evening.filter((id) => id !== productId),
      },
    };

    await save(updated);
    deleteProductImage(removed?.image);
    return updated;
  });
}
