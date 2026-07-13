import type { Page } from "@playwright/test";

export const readLocalData = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("local_data_v1")!));

export const seedLocalData = (
  page: Page,
  products: object[],
  routineConfig = { morning: [] as string[], evening: [] as string[] },
) =>
  page.evaluate(
    ({ products, routineConfig }) => {
      localStorage.setItem(
        "local_data_v1",
        JSON.stringify({ version: 1, products, routineConfig }),
      );
    },
    { products, routineConfig },
  );
