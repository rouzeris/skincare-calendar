import { test, expect } from "@playwright/test";
import { readLocalData, seedLocalData } from "./local-data";

test.describe("Product Shelf Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole("tab", { name: "Shelf" }).click();
  });

  test("add product with expiration tracking", async ({ page }) => {
    // 1. Start from empty shelf
    await expect(page.getByText("Your shelf is empty")).toBeVisible();
    await page.getByText("Add First Product").click();

    // 2. Fill product details
    await page.getByPlaceholder(/Niacinamide/).fill("Hyaluronic Acid Serum");
    await page.getByPlaceholder(/The Ordinary/).fill("The Ordinary");

    // 3. Save product
    await page.getByText("Save").click();

    // 4. Verify product appears on shelf
    await expect(page.getByText("Hyaluronic Acid Serum")).toBeVisible();
    await expect(page.getByText("The Ordinary")).toBeVisible();

    // 5. Verify product was persisted
    const { products } = await readLocalData(page);
    expect(products[0].name).toBe("Hyaluronic Acid Serum");
  });

  test("track product expiration status", async ({ page }) => {
    // Setup: Add product opened 6 months ago with 12-month PAO
    const product = await page.evaluate(() => {
      const openedDate = new Date();
      openedDate.setMonth(openedDate.getMonth() - 6);
      return {
        id: "tracking-test",
        name: "Retinol Serum",
        brand: "Paula's Choice",
        openedAt: openedDate.toISOString(),
        periodAfterOpening: 12,
        frequency: { type: "daily" },
      };
    });
    await seedLocalData(page, [product]);
    await page.reload();
    await page.getByRole("tab", { name: "Shelf" }).click();

    // Verify product shows with expiration info (~180 days left)
    await expect(page.getByText("Retinol Serum")).toBeVisible();
    await expect(page.getByText(/days left/)).toBeVisible();
  });

  test("warn about expired products", async ({ page }) => {
    // Setup: Add product that expired 2 months ago
    const product = await page.evaluate(() => {
      const openedDate = new Date();
      openedDate.setMonth(openedDate.getMonth() - 14); // 14 months ago

      return {
        id: "expired-test",
        name: "Old Moisturizer",
        brand: "CeraVe",
        openedAt: openedDate.toISOString(),
        periodAfterOpening: 12, // 12-month PAO = expired
        frequency: { type: "daily" },
      };
    });
    await seedLocalData(page, [product]);
    await page.reload();
    await page.getByRole("tab", { name: "Shelf" }).click();

    // Verify expired warning appears
    await expect(page.getByText("Old Moisturizer")).toBeVisible();
    await expect(page.getByText(/Expired/)).toBeVisible();
  });

  test("show product suggestions when typing", async ({ page }) => {
    await page.getByText("Add First Product").click();

    // 1. Type partial product name
    const productName = page.getByPlaceholder(/Niacinamide/);
    const brand = page.getByPlaceholder(/The Ordinary/);
    await productName.fill("CeraVe");
    await expect(page.getByText("Searching catalog…")).toBeVisible();

    // 2. Verify suggestions appear from the shared catalog
    await expect(page.getByText(/Hydrating Facial Cleanser/i)).toBeVisible();
    await expect(page.getByText(/CeraVe/).first()).toBeVisible();

    // 3. Empty results replace rows without remounting the dropdown surface
    const dropdown = page.getByTestId("catalog-suggestions");
    const dropdownElement = await dropdown.elementHandle();
    await productName.fill("no-such-catalog-product");
    await expect(page.getByText(/Hydrating Facial Cleanser/i)).toBeVisible();
    await expect(page.getByText("No catalog matches")).toBeVisible();
    expect(
      await dropdownElement!.evaluate((element) => element.isConnected),
    ).toBe(true);

    // 4. Selecting a result fills both product fields
    await productName.fill("CeraVe");
    await page.getByText(/Hydrating Facial Cleanser/i).click();
    await expect(productName).toHaveValue(/Hydrating Facial Cleanser/i);
    await expect(brand).toHaveValue("CeraVe");
  });

  test("deleting a product also removes it from routines", async ({ page }) => {
    await seedLocalData(
      page,
      [{ id: "delete-me", name: "Delete Me", brand: "Test Brand" }],
      { morning: ["delete-me"], evening: ["delete-me"] },
    );
    await page.reload();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete Delete Me" }).click();
    await expect(page.getByText("Delete Me")).not.toBeVisible();
    await page.reload();

    const { routineConfig } = await readLocalData(page);
    expect(routineConfig).toEqual({ morning: [], evening: [] });
    await expect(page.getByText("Delete Me")).not.toBeVisible();
  });
});
