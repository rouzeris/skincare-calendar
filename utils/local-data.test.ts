import { beforeEach, expect, mock, test } from "bun:test";

const storage = new Map<string, string>();

mock.module("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => storage.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      await Promise.resolve();
      storage.set(key, value);
    },
  },
}));

mock.module("@/utils/product-image", () => ({
  persistProductImage: (uri: string) => uri,
  deleteProductImage: () => undefined,
}));

const {
  createProduct,
  localDataKeys,
  readProducts,
  readRoutineConfig,
  removeProduct,
} = await import("./local-data");

beforeEach(() => storage.clear());

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
