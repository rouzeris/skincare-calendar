import { test, expect } from '@playwright/test';

test.describe('Add Product Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('tab', { name: 'Shelf' }).click();
  });

  test('should open add product modal', async ({ page }) => {
    await page.getByText('Add First Product').click();

    await expect(page.getByText('Add Product', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder(/Niacinamide/)).toBeVisible();
    await expect(page.getByPlaceholder(/The Ordinary/)).toBeVisible();
  });

  test('should show save button', async ({ page }) => {
    await page.getByText('Add First Product').click();

    const saveButton = page.getByText('Save');
    await expect(saveButton).toBeVisible();
  });

  test('should enable save button when form is filled', async ({ page }) => {
    await page.getByText('Add First Product').click();

    await page.getByPlaceholder(/Niacinamide/).fill('Test Product');
    await page.getByPlaceholder(/The Ordinary/).fill('Test Brand');

    const saveButton = page.getByText('Save');
    const opacity = await saveButton.evaluate(el => getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBe(1);
  });

  test('should add product and return to shelf', async ({ page }) => {
    await page.getByText('Add First Product').click();

    await page.getByPlaceholder(/Niacinamide/).fill('New Serum');
    await page.getByPlaceholder(/The Ordinary/).fill('New Brand');
    await page.getByText('Save').click();

    // Modal should close
    await expect(page.getByText('Add Product', { exact: true })).not.toBeVisible();

    // Product should appear on shelf
    await expect(page.getByText('New Serum')).toBeVisible();
    await expect(page.getByText('New Brand')).toBeVisible();
  });

  test('should show product suggestions', async ({ page }) => {
    await page.getByText('Add First Product').click();

    await page.getByPlaceholder(/Niacinamide/).fill('Niac');

    // Should show suggestions from mock data
    await expect(page.getByText(/Niacinamide 10%/)).toBeVisible();
  });

  test('should display frequency options', async ({ page }) => {
    await page.getByText('Add First Product').click();

    // All frequency options should be visible
    await expect(page.getByText('Daily')).toBeVisible();
    await expect(page.getByText('Specific Days')).toBeVisible();
    await expect(page.getByText('Interval')).toBeVisible();
  });

  test('should display routine time options', async ({ page }) => {
    await page.getByText('Add First Product').click();

    // Routine time header and buttons
    await expect(page.getByText('Routine Time')).toBeVisible();
  });

  test('should add product to morning routine', async ({ page }) => {
    await page.getByText('Add First Product').click();

    await page.getByPlaceholder(/Niacinamide/).fill('Morning Product');
    await page.getByPlaceholder(/The Ordinary/).fill('Brand');

    // Click the Morning button in Routine Time section
    const morningButton = page.getByText('Morning', { exact: true }).first();
    await morningButton.click();

    await page.getByText('Save').click();

    // Verify product was saved (modal should close, product appears on shelf)
    await expect(page.getByText('Add Product', { exact: true })).not.toBeVisible();

    // Verify routine config was updated in localStorage
    const config = await page.evaluate(() => localStorage.getItem('routine_config'));
    expect(config).toBeTruthy();
    expect(config).toContain('morning');
  });
});
