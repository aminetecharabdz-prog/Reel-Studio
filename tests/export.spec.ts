import { expect, test } from '@playwright/test';

test('demo project: preview plays and MP4 export finishes in the browser', async ({ page }) => {
  test.setTimeout(900_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#/p/demo-phone-holder');
  await expect(page.locator('.__remotion-player')).toBeVisible({ timeout: 60_000 });
  await page.getByTestId('export-fast').click();
  await expect(page.getByTestId('export-progress')).toBeVisible();
  const download = page.waitForEvent('download', { timeout: 880_000 });
  await expect(page.getByTestId('export-done').or(page.getByText('تعذّر التصدير'))).toBeVisible({ timeout: 880_000 });
  await expect(page.getByTestId('export-done')).toBeVisible();
  const d = await download;
  const path = await d.path();
  expect(path).toBeTruthy();
  await d.saveAs(`test-results/export-phone-holder.${d.suggestedFilename().split('.').pop()}`);
  expect(errors).toEqual([]);
});
