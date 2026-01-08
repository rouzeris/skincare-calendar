import { test, expect } from '@playwright/test';

test.describe('Settings Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Use text content for tab navigation since getByRole may not work with Expo tabs
    await page.locator('text=Settings').first().click();
    await page.waitForTimeout(500); // Wait for navigation
  });

  test('should display settings sections', async ({ page }) => {
    await expect(page.getByText('Membership')).toBeVisible();
    await expect(page.getByText('Appearance')).toBeVisible();
  });

  test('should display membership card for non-pro users', async ({ page }) => {
    await expect(page.getByText('Join the Club')).toBeVisible();
  });

  test('should display theme options', async ({ page }) => {
    await expect(page.getByText('Light')).toBeVisible();
    await expect(page.getByText('Dark')).toBeVisible();
    await expect(page.getByText('Auto')).toBeVisible();
  });

  test('should switch to light theme', async ({ page }) => {
    await page.getByText('Light').click();

    // Verify theme is saved in AsyncStorage (web uses localStorage)
    await page.waitForTimeout(300);
    const theme = await page.evaluate(() => localStorage.getItem('themeMode'));
    expect(theme).toBe('light');
  });

  test('should switch to dark theme', async ({ page }) => {
    await page.getByText('Dark').click();

    await page.waitForTimeout(300);
    const theme = await page.evaluate(() => localStorage.getItem('themeMode'));
    expect(theme).toBe('dark');
  });

  test('should switch to auto theme', async ({ page }) => {
    await page.getByText('Auto').click();

    await page.waitForTimeout(300);
    const theme = await page.evaluate(() => localStorage.getItem('themeMode'));
    expect(theme).toBe('auto');
  });

  test('should display version number', async ({ page }) => {
    await expect(page.getByText('Version 1.0.0')).toBeVisible();
  });

  test('should display privacy policy link', async ({ page }) => {
    await expect(page.getByText('Privacy Policy')).toBeVisible();
  });

  test('should display terms of service link', async ({ page }) => {
    await expect(page.getByText('Terms of Service')).toBeVisible();
  });

  test('should display support section', async ({ page }) => {
    await expect(page.getByText('Contact Support')).toBeVisible();
    await expect(page.getByText('support@rork.com')).toBeVisible();
    await expect(page.getByText('Rate the App')).toBeVisible();
  });
});
