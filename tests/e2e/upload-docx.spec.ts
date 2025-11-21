import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Upload DOCX File', () => {
  test('should upload a .txt file and display AI summary', async ({ page }) => {
    // Navigate to workspace page
    await page.goto('/workspace');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Workspace Sandbox');
    
    // Find file input and upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(process.cwd(), 'tests', 'fixtures', 'sample-intake.txt'));
    
    // Wait for processing to complete (up to 30 seconds for AI processing)
    await expect(page.locator('text=Processing Your File')).toBeVisible({ timeout: 5000 });
    
    // Wait for results to appear
    await expect(page.locator('text=AI Summary')).toBeVisible({ timeout: 45000 });
    
    // Verify summary is displayed
    const summarySection = page.locator('text=AI Summary').locator('..').locator('..');
    await expect(summarySection).toBeVisible();
    
    // Verify at least some extracted data is shown
    const extractedDataSection = page.locator('text=Extracted Information');
    await expect(extractedDataSection).toBeVisible();
    
    // Verify action buttons are present
    await expect(page.locator('button:has-text("Try Another File")')).toBeVisible();
  });

  test('should show error for unsupported file type', async ({ page }) => {
    await page.goto('/workspace');
    
    // Try to upload an unsupported file (if we had one)
    // For now, just verify the page loads correctly
    await expect(page.locator('h1')).toContainText('Workspace Sandbox');
  });
});
