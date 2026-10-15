import { expect, test } from '@playwright/test';

/** Full creation flow at phone size with no keys (demo mode): upload → transcript (typed) → generate → preview. */
test('new project: upload voice, type transcript, generate, preview @live', async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#/new?mode=A');
  await page.getByTestId('mode-A').click();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByTestId('voice-input').setInputFiles('public/demo/engine.mp3');
  await expect(page.getByText('تم رفع الملف')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByPlaceholder(/اكتب هنا ما قلته/).fill('كيفاش يخدم موتور الطوموبيل؟ في ربع ثانية برك يصرا كلش. الموتور يخدم بـ 4 مراحل.');
  await page.getByTestId('transcribe').click();
  await expect(page.getByRole('heading', { name: 'راجع النص' })).toBeVisible({ timeout: 30_000 });
  await page.getByTestId('to-generate').click();
  await expect(page.locator('.__remotion-player')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('scene-chip').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test('demo projects open and play @live', async ({ page }) => {
  test.setTimeout(120_000);
  for (const id of ['dentist', 'engine', 'phone-holder', 'talking']) {
    await page.goto(`./#/p/demo-${id}`);
    await expect(page.locator('.__remotion-player')).toBeVisible({ timeout: 60_000 });
  }
});
