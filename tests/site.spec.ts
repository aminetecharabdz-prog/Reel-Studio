import { expect, test, type Page } from '@playwright/test';

/** Site gate (MISSION_V4 §5): every section loads at 412×915 and 1440×900 with zero console errors. */
const watch = (page: Page) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
};

const ROUTES: Array<[string, RegExp]> = [
  ['/', /ارسم فيديوك بالكلام/],
  ['/styles', /الستايلات العشرة/],
  ['/styles/product', /إطلاق منتج/],
  ['/styles/map-journey', /رحلة الخريطة/],
  ['/create', /ماذا تريد أن تصنع/],
  ['/projects', /مشاريعي/],
  ['/brand', /هوية علامتي/],
  ['/settings', /مفاتيح الخدمات/],
  ['/help', /المساعدة/],
  ['/about', /الاعتمادات/],
  ['/privacy', /الخصوصية/],
];

for (const [path, heading] of ROUTES) {
  test(`page ${path} renders without errors`, async ({ page }, info) => {
    const errors = watch(page);
    await page.goto(`./#${path}`);
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
    // no horizontal overflow on phones
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath(`${path.replace(/\//g, '_') || 'home'}.png`) });
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

test('wizard: goal → style → content → settings, autosaved to projects', async ({ page }) => {
  const errors = watch(page);
  await page.goto('./#/create');
  await page.getByRole('button', { name: /إعلان منتج/ }).click();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: /اختيار تلقائي/ }).click();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByLabel('اسم المنتج').fill('ساعة كلاسيك');
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByRole('heading', { name: 'الإعدادات' })).toBeVisible();
  await page.getByRole('radio', { name: '1:1', exact: true }).click();
  await page.waitForTimeout(800);
  await page.goto('./#/projects');
  await expect(page.getByText('ساعة كلاسيك')).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('settings: key saved in this browser and theme toggles', async ({ page }) => {
  await page.goto('./#/settings');
  await page.getByLabel('مفتاح Claude (Anthropic)').fill('sk-ant-test');
  await expect(page.getByText('مضاف').first()).toBeVisible();
  await page.getByRole('radio', { name: 'فاتح' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('studio: ad script → scene plan → live preview → export downloads a video', async ({ page }) => {
  test.setTimeout(300_000);
  const errors = watch(page);
  await page.goto('./#/create?goal=ad');
  await page.getByRole('button', { name: /إطلاق منتج/ }).first().click();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.locator('textarea').first().fill('ساعتك القديمة تعبتك؟\nجرب ساعة نوفا الذكية\nتحسب خطواتك، قلبك ونومك\nبـ 6900 دينار بدل 9500\nاطلبها اليوم');
  await page.getByLabel('اسم المنتج').fill('نوفا');
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByRole('heading', { name: 'خطة المشاهد' })).toBeVisible();
  await expect(page.getByText('واجهة المنتج').first()).toBeVisible();
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.locator('.__remotion-player').first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'التالي' }).click();
  const dl = page.waitForEvent('download', { timeout: 240_000 });
  await page.getByRole('button', { name: 'صدّر الفيديو' }).click();
  const d = await dl;
  expect((await d.createReadStream())).toBeTruthy();
  await expect(page.getByText(/^تم!/)).toBeVisible();
  expect(errors.filter((e) => !/usage event|register-usage|Failed to load resource/.test(e)), errors.join('\n')).toEqual([]);
});

test('style page plays the engine preview', async ({ page }) => {
  await page.goto('./#/styles/product');
  await expect(page.locator('.__remotion-player').first()).toBeVisible({ timeout: 30_000 });
});
