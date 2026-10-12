import { test as base, expect, type Page } from "@playwright/test";

/** Every test fails if the page throws an uncaught error. */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await use(errors);
      expect(errors, "uncaught page errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Asserts the current page has no horizontal overflow at a 375 px phone width. */
export async function expectNoMobileOverflow(page: Page) {
  const original = page.viewportSize();
  await page.setViewportSize({ width: 375, height: 812 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow on ${page.url()}`).toBeLessThanOrEqual(0);
  if (original) await page.setViewportSize(original);
}
