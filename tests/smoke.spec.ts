import { expect, test } from '@playwright/test';

test('landing opens on a phone and shows the brand @live', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByLabel(/نبرة/).first()).toBeVisible();
  await page.screenshot({ path: info.outputPath('landing.png'), fullPage: false });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'no horizontal scroll on phone').toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});
