import { test, expect } from "@playwright/test";

test.describe("Routine Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("complete daily skincare routine flow", async ({ page }) => {
    // 1. Start with empty routine, go to shelf to add product
    await expect(page.getByText("Your routine is empty")).toBeVisible();
    await page.getByText("Go to Shelf").click();

    // 2. Add a product from shelf
    await page.getByText("Add First Product").click();
    await page.getByPlaceholder(/Niacinamide/).fill("Vitamin C Serum");
    await page.getByPlaceholder(/The Ordinary/).fill("Skinceuticals");

    // 3. Assign to morning routine
    await page.getByText("Morning", { exact: true }).first().click();
    await page.getByText("Save").click();

    // 4. Navigate to routine and verify product appears
    await page.getByRole("tab", { name: "Routine" }).click();
    await expect(page.getByText("Vitamin C Serum").first()).toBeVisible();
    await expect(page.getByText("Skinceuticals").first()).toBeVisible();

    // 5. Complete the product (click to toggle)
    await page.getByText("Vitamin C Serum").first().click();

    // 6. Verify completion was saved
    const history = await page.evaluate(() =>
      localStorage.getItem("routine_history"),
    );
    expect(history).toContain("morning");
  });

  test("manage morning and evening routines separately", async ({ page }) => {
    // Setup: Add two products with different routine times
    await page.evaluate(() => {
      const products = [
        {
          id: "morning-prod",
          name: "Morning Cleanser",
          brand: "CeraVe",
          frequency: { type: "daily" },
        },
        {
          id: "evening-prod",
          name: "Night Cream",
          brand: "La Roche-Posay",
          frequency: { type: "daily" },
        },
      ];
      localStorage.setItem("cosmetics_shelf", JSON.stringify(products));
      localStorage.setItem(
        "routine_config",
        JSON.stringify({
          morning: ["morning-prod"],
          evening: ["evening-prod"],
        }),
      );
    });
    await page.reload();

    // 1. Verify both sections appear with correct products
    await expect(page.getByText("Morning Cleanser")).toBeVisible();
    await expect(page.getByText("CeraVe")).toBeVisible();
    await expect(page.getByText("Night Cream")).toBeVisible();
    await expect(page.getByText("La Roche-Posay")).toBeVisible();

    // 2. Complete morning product
    await page.getByText("Morning Cleanser").click();

    // 3. Complete evening product
    await page.getByText("Night Cream").click();

    // 4. Verify both completions saved
    const history = await page.evaluate(() =>
      localStorage.getItem("routine_history"),
    );
    expect(history).toContain("morning-prod");
    expect(history).toContain("evening-prod");
  });

  test("weekly frequency products only show on scheduled days", async ({
    page,
  }) => {
    const today = new Date().getDay();
    const tomorrow = (today + 1) % 7;

    // Setup: Product scheduled for tomorrow only
    await page.evaluate((dayIndex) => {
      const product = {
        id: "weekly-treatment",
        name: "Retinol Treatment",
        brand: "Paula's Choice",
        frequency: { type: "weekly", daysOfWeek: [dayIndex] },
      };
      localStorage.setItem("cosmetics_shelf", JSON.stringify([product]));
      localStorage.setItem(
        "routine_config",
        JSON.stringify({ morning: ["weekly-treatment"], evening: [] }),
      );
    }, tomorrow);
    await page.reload();

    // Product should NOT appear today since it's scheduled for tomorrow
    await expect(page.getByText("Retinol Treatment")).not.toBeVisible();
  });
});
