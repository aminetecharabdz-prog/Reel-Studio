import { expect, test, type Page } from '@playwright/test';

const noOverflow = async (page: Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);

test('home: brand, hero reel, demos, no horizontal scroll @live', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await expect(page).toHaveTitle(/Motiq/);
  await expect(page.getByTestId('cta-start')).toBeVisible();
  await expect(page.locator('.__remotion-player').first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('demo-content')).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

for (const id of ['content', 'product', 'shorts']) {
  test(`demo ${id} opens in the studio and plays @live`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`./#/demo/${id}`);
    await expect(page.locator('.__remotion-player')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('tab-style').click();
    await expect(page.locator('input[type=color]').first()).toBeVisible();
    await page.getByTestId('tab-export').click();
    await expect(page.getByTestId('export')).toBeVisible();
    await noOverflow(page);
    expect(errors).toEqual([]);
  });
}

test('create flow without keys: local director builds a video @live', async ({ page }) => {
  await page.goto('./#/new');
  await page.getByTestId('mode-content').click();
  await page.getByTestId('script').fill('عندك فكرة قوية ومنتوج مليح بزاف. بصح الناس ما يشوفوكش. المحتوى بلا جمهور غير ضجيج. ابدا اليوم.');
  await page.getByTestId('generate').click();
  await expect(page.locator('.__remotion-player')).toBeVisible({ timeout: 60_000 });
  await noOverflow(page);
});

test('settings: keys are stored locally @live', async ({ page }) => {
  await page.goto('./#/settings');
  await page.getByTestId('key-gemini').fill('test-key-123');
  await page.getByTestId('key-gemini').blur();
  await page.reload();
  await expect(page.getByTestId('key-gemini')).toHaveValue('test-key-123');
  await noOverflow(page);
});
