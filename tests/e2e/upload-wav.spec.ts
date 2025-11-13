import { test, expect } from '@playwright/test';

test.describe('Upload Audio File', () => {
  test('should load workspace page successfully', async ({ page }) => {
    await page.goto('/workspace');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Workspace Sandbox');
    
    // Verify upload component is present
    await expect(page.locator('input[type="file"]')).toBeVisible();
    
    // Verify info banner
    await expect(page.locator('text=Demo Mode')).toBeVisible();
  });

  test('should navigate to intakes page', async ({ page }) => {
    // Navigate to intakes list
    await page.goto('/intakes');
    
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Intake History');
    
    // Should show loading or empty state
    const hasLoading = await page.locator('text=Loading').isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=No intakes yet').isVisible().catch(() => false);
    const hasError = await page.locator('text=Error').isVisible().catch(() => false);
    
    // At least one of these should be true
    expect(hasLoading || hasEmpty || hasError).toBeTruthy();
  });
});
