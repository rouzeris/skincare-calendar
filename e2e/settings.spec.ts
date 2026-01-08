import { test, expect } from '@playwright/test';

test.describe('Settings & Preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('text=Settings').first().click();
    await page.waitForTimeout(300);
  });

  test('switch theme and verify persistence', async ({ page }) => {
    // 1. Verify all theme options visible
    await expect(page.getByText('Light')).toBeVisible();
    await expect(page.getByText('Dark')).toBeVisible();
    await expect(page.getByText('Auto')).toBeVisible();

    // 2. Switch to dark theme
    await page.getByText('Dark').click();
    await page.waitForTimeout(200);

    // 3. Verify theme saved
    let theme = await page.evaluate(() => localStorage.getItem('themeMode'));
    expect(theme).toBe('dark');

    // 4. Switch to light theme
    await page.getByText('Light').click();
    await page.waitForTimeout(200);
    theme = await page.evaluate(() => localStorage.getItem('themeMode'));
    expect(theme).toBe('light');

    // 5. Reload and verify persistence
    await page.reload();
    await page.locator('text=Settings').first().click();
    theme = await page.evaluate(() => localStorage.getItem('themeMode'));
    expect(theme).toBe('light');
  });

  test('access legal and support options', async ({ page }) => {
    // 1. Verify membership section
    await expect(page.getByText('Membership')).toBeVisible();
    await expect(page.getByText('Join the Club')).toBeVisible();

    // 2. Verify support options
    await expect(page.getByText('Contact Support')).toBeVisible();
    await expect(page.getByText('support@rork.com')).toBeVisible();
    await expect(page.getByText('Rate the App')).toBeVisible();

    // 3. Verify legal links
    await expect(page.getByText('Privacy Policy')).toBeVisible();
    await expect(page.getByText('Terms of Service')).toBeVisible();

    // 4. Verify version displayed
    await expect(page.getByText('Version 1.0.0')).toBeVisible();
  });
});
