import { test, expect } from "@playwright/test";

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
    const shelf = await page.evaluate(() =>
      localStorage.getItem("cosmetics_shelf"),
    );
    expect(shelf).toContain("Hyaluronic Acid Serum");
  });

  test("track product expiration status", async ({ page }) => {
    // Setup: Add product opened 6 months ago with 12-month PAO
    await page.evaluate(() => {
      const openedDate = new Date();
      openedDate.setMonth(openedDate.getMonth() - 6);

      const product = {
        id: "tracking-test",
        name: "Retinol Serum",
        brand: "Paula's Choice",
        openedAt: openedDate.toISOString(),
        periodAfterOpening: 12,
        frequency: { type: "daily" },
      };
      localStorage.setItem("cosmetics_shelf", JSON.stringify([product]));
    });
    await page.reload();
    await page.getByRole("tab", { name: "Shelf" }).click();

    // Verify product shows with expiration info (~180 days left)
    await expect(page.getByText("Retinol Serum")).toBeVisible();
    await expect(page.getByText(/days left/)).toBeVisible();
  });

  test("warn about expired products", async ({ page }) => {
    // Setup: Add product that expired 2 months ago
    await page.evaluate(() => {
      const openedDate = new Date();
      openedDate.setMonth(openedDate.getMonth() - 14); // 14 months ago

      const product = {
        id: "expired-test",
        name: "Old Moisturizer",
        brand: "CeraVe",
        openedAt: openedDate.toISOString(),
        periodAfterOpening: 12, // 12-month PAO = expired
        frequency: { type: "daily" },
      };
      localStorage.setItem("cosmetics_shelf", JSON.stringify([product]));
    });
    await page.reload();
    await page.getByRole("tab", { name: "Shelf" }).click();

    // Verify expired warning appears
    await expect(page.getByText("Old Moisturizer")).toBeVisible();
    await expect(page.getByText(/Expired/)).toBeVisible();
  });

  test("show product suggestions when typing", async ({ page }) => {
    await page.getByText("Add First Product").click();

    // 1. Type partial product name
    await page.getByPlaceholder(/Niacinamide/).fill("Niac");

    // 2. Verify suggestions appear from mock database
    await expect(page.getByText(/Niacinamide 10%/)).toBeVisible();
    await expect(page.getByText(/The Ordinary/)).toBeVisible();
  });

  test("deleting a product also removes it from routines", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem(
        "cosmetics_shelf",
        JSON.stringify([
          { id: "delete-me", name: "Delete Me", brand: "Test Brand" },
        ]),
      );
      localStorage.setItem(
        "routine_config",
        JSON.stringify({ morning: ["delete-me"], evening: ["delete-me"] }),
      );
    });
    await page.reload();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete Delete Me" }).click();
    await expect(page.getByText("Delete Me")).not.toBeVisible();
    await page.reload();

    const config = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("routine_config")!),
    );
    expect(config).toEqual({ morning: [], evening: [] });
    await expect(page.getByText("Delete Me")).not.toBeVisible();
  });
});
