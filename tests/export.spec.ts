import { expect, test } from '@playwright/test';

test('demo export finishes in the browser and downloads a video @export', async ({ page }) => {
  test.setTimeout(1_200_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#/demo/product');
  await expect(page.locator('.__remotion-player')).toBeVisible({ timeout: 60_000 });
  await page.getByTestId('tab-export').click();
  await page.getByText('720p أسرع').click();
  const download = page.waitForEvent('download', { timeout: 1_150_000 });
  await page.getByTestId('export').click();
  await expect(page.getByTestId('export-progress')).toBeVisible();
  const d = await download;
  await d.saveAs(`test-results/export-product.${d.suggestedFilename().split('.').pop()}`);
  await expect(page.getByTestId('export-done')).toBeVisible();
  expect(errors).toEqual([]);
});
