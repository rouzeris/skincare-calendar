import { test, expect } from '@playwright/test';

test.describe('Routine Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display calendar strip', async ({ page }) => {
    // Should see day abbreviations in the calendar
    await expect(page.getByText('Mon').first()).toBeVisible();
    await expect(page.getByText('Tue').first()).toBeVisible();
    await expect(page.getByText('Wed').first()).toBeVisible();
  });

  test('should display morning and evening sections with products', async ({ page }) => {
    await page.evaluate(() => {
      const product = {
        id: 'test-1',
        name: 'Test Serum',
        brand: 'Test Brand',
        frequency: { type: 'daily' }
      };
      const config = { morning: ['test-1'], evening: [] };

      localStorage.setItem('cosmetics_shelf', JSON.stringify([product]));
      localStorage.setItem('routine_config', JSON.stringify(config));
    });

    await page.reload();

    await expect(page.getByText('Morning')).toBeVisible();
    await expect(page.getByText('Test Serum')).toBeVisible();
    await expect(page.getByText('Test Brand')).toBeVisible();
  });

  test('should toggle product completion on click', async ({ page }) => {
    await page.evaluate(() => {
      const product = {
        id: 'toggle-test',
        name: 'Toggle Product',
        brand: 'Brand',
        frequency: { type: 'daily' }
      };
      localStorage.setItem('cosmetics_shelf', JSON.stringify([product]));
      localStorage.setItem('routine_config', JSON.stringify({ morning: ['toggle-test'], evening: [] }));
      localStorage.setItem('routine_history', JSON.stringify({}));
    });

    await page.reload();

    // Click the product to toggle completion
    await page.getByText('Toggle Product').click();

    // Verify history was updated
    const history = await page.evaluate(() => localStorage.getItem('routine_history'));
    expect(history).toContain('toggle-test');
  });

  test('should show products in both morning and evening', async ({ page }) => {
    await page.evaluate(() => {
      const products = [
        { id: 'morning-product', name: 'Morning Cleanser', brand: 'AM Brand', frequency: { type: 'daily' } },
        { id: 'evening-product', name: 'Night Cream', brand: 'PM Brand', frequency: { type: 'daily' } }
      ];
      localStorage.setItem('cosmetics_shelf', JSON.stringify(products));
      localStorage.setItem('routine_config', JSON.stringify({
        morning: ['morning-product'],
        evening: ['evening-product']
      }));
    });

    await page.reload();

    // Check for products in both sections
    await expect(page.getByText('Morning Cleanser')).toBeVisible();
    await expect(page.getByText('AM Brand')).toBeVisible();
    await expect(page.getByText('Night Cream')).toBeVisible();
    await expect(page.getByText('PM Brand')).toBeVisible();
  });

  test('should respect weekly frequency', async ({ page }) => {
    const today = new Date().getDay();
    const notToday = (today + 1) % 7;

    await page.evaluate((dayIndex) => {
      const product = {
        id: 'weekly-product',
        name: 'Weekly Treatment',
        brand: 'Brand',
        frequency: { type: 'weekly', daysOfWeek: [dayIndex] }
      };
      localStorage.setItem('cosmetics_shelf', JSON.stringify([product]));
      localStorage.setItem('routine_config', JSON.stringify({ morning: ['weekly-product'], evening: [] }));
    }, notToday);

    await page.reload();

    // Product should NOT be visible today since it's for a different day
    await expect(page.getByText('Weekly Treatment')).not.toBeVisible();
  });
});
