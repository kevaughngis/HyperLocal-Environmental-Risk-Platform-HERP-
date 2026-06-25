import { test, expect } from '@playwright/test';

test('integrated dashboard shows real data', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for loading to disappear or for a score to appear
  // Our backend returns a riskScore. Let's wait for the "Environmental Risk" panel to update.
  const riskScore = page.locator('text=/^[0-9]+$/').first();
  await expect(riskScore).toBeVisible({ timeout: 10000 });

  // Check for weather data
  await expect(page.locator('text=°C')).toBeVisible();

  // Check for AQI
  await expect(page.locator('text=AQI:')).toBeVisible();

  await page.screenshot({ path: 'verification/integrated_final.png', fullPage: true });
});
