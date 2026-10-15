import { expect, test } from '@playwright/test';

/** SPEC §8.1 regression: no text may overflow its box or leave the frame, in any scene of any demo. */
for (const demo of ['dentist', 'engine', 'phone-holder', 'talking']) {
  for (const at of ['0.5', '1.5', '3.0']) {
    test(`no text overflow — ${demo} @ ${at}s @live`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: 1400, height: 900 });
      await page.goto(`./#/qa?demo=${demo}&at=${at}`);
      await page.waitForSelector('[data-testid=qa-sheet]', { timeout: 90_000 });
      await page.waitForTimeout(1500);
      const res = await page.evaluate(() => {
        const overflow = document.querySelectorAll('[data-fit-overflow]').length;
        // every thumbnail: text spans must stay inside the frame
        const outside: string[] = [];
        document.querySelectorAll('[data-testid=qa-sheet] > div').forEach((cell, i) => {
          const frame = cell.firstElementChild!.getBoundingClientRect();
          cell.firstElementChild!.querySelectorAll('span, div').forEach((el) => {
            const e = el as HTMLElement;
            if (!e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) return;
            const op = Number(getComputedStyle(e).opacity);
            if (op === 0) return;
            const r = e.getBoundingClientRect();
            const tol = 2;
            if (r.width > 0 && (r.left < frame.left - tol || r.right > frame.right + tol)) outside.push(`scene ${i + 1}: "${e.textContent!.slice(0, 20)}"`);
          });
        });
        return { overflow, outside };
      });
      expect(res.overflow, 'FitText overflow markers').toBe(0);
      expect(res.outside, 'text outside the frame').toEqual([]);
    });
  }
}
