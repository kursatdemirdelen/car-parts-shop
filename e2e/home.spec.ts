import { expect, expectNoMobileOverflow, test } from "./fixtures";

const carousel = (page: import("@playwright/test").Page) => page.locator('section[aria-roledescription="carousel"]');
const activeSlide = (page: import("@playwright/test").Page) => carousel(page).locator('[aria-roledescription="slide"]:not([aria-hidden="true"])');

test("hero slider can be paused and navigated", async ({ page }) => {
  await page.goto("/");
  await expect(activeSlide(page)).toContainText("Doğru parça, ilk seferde");
  await expect(page.getByRole("searchbox").or(page.getByRole("combobox")).first()).toBeVisible();

  await page.getByRole("button", { name: "Sonraki slayt" }).click();
  await expect(activeSlide(page)).toContainText("Bakımını kaçırma");

  await page.getByRole("button", { name: "Slaytları durdur" }).click();
  await expect(page.getByRole("button", { name: "Slaytları oynat" })).toBeVisible();
  await page.waitForTimeout(6500);
  await expect(activeSlide(page)).toContainText("Bakımını kaçırma");
  await expectNoMobileOverflow(page);
});

test("hero slider advances on its own", async ({ page }) => {
  await page.goto("/");
  await expect(activeSlide(page)).toContainText("Doğru parça, ilk seferde");
  await page.mouse.move(0, 700); // keep the pointer off the slider
  await expect(activeSlide(page)).toContainText("Bakımını kaçırma", { timeout: 9000 });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("does not autoplay", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Slaytları oynat" })).toBeVisible();
    await page.waitForTimeout(6500);
    await expect(activeSlide(page)).toContainText("Doğru parça, ilk seferde");
  });
});

test("campaign bar can be dismissed for the session", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("2.500 TL üzeri siparişlerde ücretsiz kargo (demo)")).toBeVisible();
  await page.getByRole("button", { name: "Duyuruyu kapat" }).click();
  await expect(page.getByText("2.500 TL üzeri siparişlerde ücretsiz kargo (demo)")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Duyuruyu kapat" })).toHaveCount(0);
});

test("a dismissed campaign bar does not shift the page on reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Duyuruyu kapat" }).click();
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  // Slow the CPU like a mid-range phone so hydration happens after the first paint.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 300, downloadThroughput: 200_000, uploadThroughput: 100_000 });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBeLessThan(0.01);
  await expect(page.getByRole("button", { name: "Duyuruyu kapat" })).toHaveCount(0);
});

test("keyboard slide changes are announced while autoplay is paused by focus", async ({ page }) => {
  await page.goto("/");
  const next = page.getByRole("button", { name: "Sonraki slayt" });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(activeSlide(page)).toContainText("Bakımını kaçırma");
  await expect(carousel(page).locator("[aria-live]")).toHaveAttribute("aria-live", "polite");
});
