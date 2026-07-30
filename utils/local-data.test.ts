import { beforeEach, expect, mock, test } from "bun:test";

const storage = new Map<string, string>();
let deletedImageDirectories = 0;
let imageDirectoryDeletionError: Error | undefined;

mock.module("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => storage.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      await Promise.resolve();
      storage.set(key, value);
    },
    multiRemove: async (keys: string[]) => {
      await Promise.resolve();
      keys.forEach((key) => storage.delete(key));
    },
  },
}));

mock.module("@/utils/product-image", () => ({
  persistProductImage: (uri: string) => uri,
  deleteProductImage: () => undefined,
  deleteAllProductImages: () => {
    deletedImageDirectories++;
    if (imageDirectoryDeletionError) throw imageDirectoryDeletionError;
  },
}));

const {
  clearLocalData,
  createProduct,
  localDataKeys,
  readProducts,
  readRoutineConfig,
  readRoutineHistory,
  removeProduct,
  toggleRoutineCompletion,
} = await import("./local-data");

beforeEach(() => {
  storage.clear();
  deletedImageDirectories = 0;
  imageDirectoryDeletionError = undefined;
});

test("serializes concurrent product creation", async () => {
  await Promise.all([
    createProduct({
      product: { name: "First", brand: "Brand" },
      times: ["morning"],
    }),
    createProduct({
      product: { name: "Second", brand: "Brand" },
      times: ["evening"],
    }),
  ]);

  const products = await readProducts();
  const routines = await readRoutineConfig();
  expect(products.map(({ name }) => name)).toEqual(["First", "Second"]);
  expect(routines.morning).toEqual([products[0].id]);
  expect(routines.evening).toEqual([products[1].id]);
});

test("does not resurrect a concurrently removed product", async () => {
  storage.set(
    localDataKeys.legacyCosmetics,
    JSON.stringify([{ id: "old", name: "Old", brand: "Brand" }]),
  );
  storage.set(
    localDataKeys.legacyRoutineConfig,
    JSON.stringify({ morning: ["old"], evening: ["old"] }),
  );

  await Promise.all([
    createProduct({
      product: { name: "New", brand: "Brand" },
      times: ["morning"],
    }),
    removeProduct("old"),
  ]);

  const products = await readProducts();
  const routines = await readRoutineConfig();
  expect(products.map(({ name }) => name)).toEqual(["New"]);
  expect(routines.morning).toEqual([products[0].id]);
  expect(routines.evening).toEqual([]);
  expect(JSON.parse(storage.get(localDataKeys.state)!)).toEqual({
    version: 1,
    products,
    routineConfig: routines,
  });
});

test("serializes concurrent routine completion updates", async () => {
  await Promise.all([
    toggleRoutineCompletion({
      date: "2026-07-14",
      timeOfDay: "morning",
      productId: "cleanser",
    }),
    toggleRoutineCompletion({
      date: "2026-07-14",
      timeOfDay: "morning",
      productId: "serum",
    }),
  ]);

  expect(await readRoutineHistory()).toEqual({
    "2026-07-14": { morning: ["cleanser", "serum"], evening: [] },
  });
});

test("clears data after an in-flight create and deletes managed images", async () => {
  await Promise.all([
    createProduct({
      product: { name: "New", brand: "Brand" },
      imageUri: "file:///new.jpg",
      times: ["morning"],
    }),
    clearLocalData(),
  ]);

  expect(await readProducts()).toEqual([]);
  expect(await readRoutineConfig()).toEqual({ morning: [], evening: [] });
  expect(await readRoutineHistory()).toEqual({});
  expect(deletedImageDirectories).toBe(1);
});

test("keeps data when managed images cannot be deleted", async () => {
  await createProduct({
    product: { name: "Before failure", brand: "Brand" },
    imageUri: "file:///before.jpg",
    times: ["morning"],
  });

  imageDirectoryDeletionError = new Error("image cleanup failed");

  await expect(clearLocalData()).rejects.toThrow("image cleanup failed");
  expect(deletedImageDirectories).toBe(1);

  // Nothing was wiped, so the user still sees their products and can retry.
  expect((await readProducts()).map(({ name }) => name)).toEqual([
    "Before failure",
  ]);
  expect((await readRoutineConfig()).morning).toHaveLength(1);

  imageDirectoryDeletionError = undefined;
  await clearLocalData();
  expect(await readProducts()).toEqual([]);
  expect(await readRoutineConfig()).toEqual({ morning: [], evening: [] });
});

test("never reuses a product id", async () => {
  const realRandom = Math.random;
  // First two draws collide; the third is free.
  const draws = [0.5, 0.5, 0.25];
  let draw = 0;
  Math.random = () => draws[draw++] ?? realRandom();

  try {
    await createProduct({ product: { name: "First", brand: "B" }, times: [] });
    await createProduct({ product: { name: "Second", brand: "B" }, times: [] });
  } finally {
    Math.random = realRandom;
  }

  const ids = (await readProducts()).map(({ id }) => id);
  expect(ids).toHaveLength(2);
  expect(new Set(ids).size).toBe(2);
  expect(draw).toBe(3);
});
