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
