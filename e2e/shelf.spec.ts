import { test, expect } from '@playwright/test';

test.describe('Shelf Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Shelf' }).click();
  });

  test('should display shelf title', async ({ page }) => {
    await expect(page.getByText('My Shelf')).toBeVisible();
  });

  test('should show empty state when no products', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('tab', { name: 'Shelf' }).click();

    await expect(page.getByText('Your shelf is empty')).toBeVisible();
    await expect(page.getByText('Add First Product')).toBeVisible();
  });

  test('should open add product modal from empty state', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('tab', { name: 'Shelf' }).click();

    await page.getByText('Add First Product').click();
    await expect(page.getByText('Add Product')).toBeVisible();
  });

  test('should display product with details', async ({ page }) => {
    await page.evaluate(() => {
      const product = {
        id: 'display-test',
        name: 'Vitamin C Serum',
        brand: 'Skinceuticals',
        frequency: { type: 'daily' }
      };
      localStorage.setItem('cosmetics_shelf', JSON.stringify([product]));
    });

    await page.reload();
    await page.getByRole('tab', { name: 'Shelf' }).click();

    await expect(page.getByText('Vitamin C Serum')).toBeVisible();
    await expect(page.getByText('Skinceuticals')).toBeVisible();
  });

  test('should show expiration countdown', async ({ page }) => {
    await page.evaluate(() => {
      const openedDate = new Date();
      openedDate.setMonth(openedDate.getMonth() - 6);

      const product = {
        id: 'exp-test',
        name: 'Retinol',
        brand: 'Brand',
        openedAt: openedDate.toISOString(),
        periodAfterOpening: 12,
        frequency: { type: 'daily' }
      };
      localStorage.setItem('cosmetics_shelf', JSON.stringify([product]));
    });

    await page.reload();
    await page.getByRole('tab', { name: 'Shelf' }).click();

    await expect(page.getByText(/days left/)).toBeVisible();
  });

  test('should show expired warning for old products', async ({ page }) => {
    await page.evaluate(() => {
      const openedDate = new Date();
      openedDate.setMonth(openedDate.getMonth() - 14);

      const product = {
        id: 'expired-test',
        name: 'Old Product',
        brand: 'Brand',
        openedAt: openedDate.toISOString(),
        periodAfterOpening: 12,
        frequency: { type: 'daily' }
      };
      localStorage.setItem('cosmetics_shelf', JSON.stringify([product]));
    });

    await page.reload();
    await page.getByRole('tab', { name: 'Shelf' }).click();

    await expect(page.getByText(/Expired/)).toBeVisible();
  });

  // Note: Delete test skipped due to React Native Web SVG interaction issues
  // Delete functionality should be tested on native with Detox/Maestro
});
