import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display tab bar with all tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Routine' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Shelf' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
  });

  test('should navigate to Routine tab by default', async ({ page }) => {
    await expect(page.getByText('My Routine')).toBeVisible();
  });

  test('should navigate to Shelf tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Shelf' }).click();
    await expect(page.getByText('My Shelf')).toBeVisible();
  });

  test('should navigate to Settings tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click();
    await expect(page.getByText('Membership')).toBeVisible();
    await expect(page.getByText('Appearance')).toBeVisible();
  });

  test('should show empty state on Routine when no products', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByText('Your routine is empty')).toBeVisible();
    await expect(page.getByText('Go to Shelf')).toBeVisible();
  });

  test('should show empty state on Shelf when no products', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByRole('tab', { name: 'Shelf' }).click();
    await expect(page.getByText('Your shelf is empty')).toBeVisible();
    await expect(page.getByText('Add First Product')).toBeVisible();
  });

  test('should navigate from empty Routine to Shelf', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByText('Go to Shelf').click();
    await expect(page.getByText('My Shelf')).toBeVisible();
  });
});
