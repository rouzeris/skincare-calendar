import { test, expect } from "@playwright/test";
import { seedLocalData } from "./local-data";

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
    await seedLocalData(page, products, {
      morning: ["morning-prod"],
      evening: ["evening-prod"],
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
    const product = {
      id: "weekly-treatment",
      name: "Retinol Treatment",
      brand: "Paula's Choice",
      frequency: { type: "weekly", daysOfWeek: [tomorrow] },
    };
    await seedLocalData(page, [product], {
      morning: ["weekly-treatment"],
      evening: [],
    });
    await page.reload();

    // Product should NOT appear today since it's scheduled for tomorrow
    await expect(page.getByText("Retinol Treatment")).not.toBeVisible();
  });

  test("interval frequency uses calendar days", async ({ page }) => {
    const product = await page.evaluate(() => {
      const openedAt = new Date();
      openedAt.setDate(openedAt.getDate() - 1);
      openedAt.setHours(23, 59, 0, 0);
      return {
        id: "interval-treatment",
        name: "Every Other Day Treatment",
        brand: "Test Brand",
        openedAt: openedAt.toISOString(),
        frequency: { type: "interval", days: 2 },
      };
    });
    await seedLocalData(page, [product], {
      morning: ["interval-treatment"],
      evening: [],
    });
    await page.reload();

    await expect(page.getByText("Every Other Day Treatment")).not.toBeVisible();
  });

  test("daily routines respect schedule boundaries", async ({ page }) => {
    const products = await page.evaluate(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return [
        {
          id: "ended-treatment",
          name: "Ended Treatment",
          brand: "Test Brand",
          endDate: yesterday.toISOString(),
          frequency: { type: "daily" },
        },
        {
          id: "future-treatment",
          name: "Future Treatment",
          brand: "Test Brand",
          openedAt: tomorrow.toISOString(),
          frequency: { type: "daily" },
        },
      ];
    });
    await seedLocalData(page, products, {
      morning: ["ended-treatment", "future-treatment"],
      evening: [],
    });
    await page.reload();

    await expect(page.getByText("Ended Treatment")).not.toBeVisible();
    await expect(page.getByText("Future Treatment")).not.toBeVisible();
  });
});
