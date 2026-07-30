import { test, expect } from "@playwright/test";
import { readLocalData } from "./local-data";

test.describe("Add Product Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole("tab", { name: "Shelf" }).click();
    await page.getByText("Add First Product").click();
  });

  test("complete product form with all frequency and routine options", async ({
    page,
  }) => {
    // 1. Verify form opened
    await expect(page.getByText("Add Product", { exact: true })).toBeVisible();

    // 2. Fill basic details
    await page.getByPlaceholder(/Niacinamide/).fill("AHA/BHA Peel");
    await page.getByPlaceholder(/The Ordinary/).fill("The Ordinary");

    // 3. Test interval frequency option
    await page.getByText("Interval").click();
    await expect(page.getByText("Repeat every")).toBeVisible();

    // 4. Switch back to daily
    await page.getByText("Daily").click();

    // 6. Select both morning and evening
    await page.getByText("Morning", { exact: true }).first().click();
    await page.getByText("Evening", { exact: true }).first().click();

    // 7. Save product
    await page.getByText("Save").click();

    // 8. Verify modal closed and product saved
    await expect(
      page.getByText("Add Product", { exact: true }),
    ).not.toBeVisible();
    await expect(page.getByText("AHA/BHA Peel").first()).toBeVisible();

    // 9. Verify routine assignment in localStorage
    const { products, routineConfig } = await readLocalData(page);
    expect(routineConfig.morning).toContain(products[0].id);
    expect(routineConfig.evening).toContain(products[0].id);
  });

  test("save product with weekly frequency", async ({ page }) => {
    // 1. Fill required fields
    await page.getByPlaceholder(/Niacinamide/).fill("Weekly Treatment");
    await page.getByPlaceholder(/The Ordinary/).fill("Brand");

    // 2. Select weekly frequency
    await page.getByText("Specific Days").click();

    // 3. Save
    await page.getByText("Save").click();

    // 4. Verify saved with weekly frequency
    const { products } = await readLocalData(page);
    expect(products[0].name).toBe("Weekly Treatment");
    expect(products[0].frequency.type).toBe("weekly");
  });
});
