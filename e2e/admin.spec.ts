import { expect, expectNoMobileOverflow, test } from "./fixtures";

test("admin creates a product that appears in the store, then deletes it", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("E-posta").fill("admin@kursatshop.demo");
  await page.getByLabel("Şifre").fill("demo1234");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page.getByRole("heading", { name: "Gösterge paneli" })).toBeVisible();

  await page.goto("/admin/products/new");
  await page.getByRole("button", { name: "Ürünü oluştur" }).first().click();
  await expect(page.getByText("Ürün adı zorunludur.")).toBeVisible();

  await page.locator("#pf-name").fill("E2E Test Balatası");
  await page.locator("#pf-sku").fill("KS-E2E-0001");
  await page.locator("#pf-status").selectOption("published");
  await page.locator("#pf-brandId").selectOption("brand-brembo");
  await page.locator("#pf-categoryId").selectOption("cat-fren-sistemi");
  await page.locator("#pf-price").fill("1.250");
  await page.locator("#pf-stock").fill("5");
  await page.getByRole("button", { name: "Ürünü oluştur" }).first().click();
  await expect(page).toHaveURL(/\/admin\/products$/);

  await page.goto("/products/e2e-test-balatasi");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("E2E Test Balatası");
  await expect(page.getByText("₺1.250,00").first()).toBeVisible();

  await page.goto("/admin/products?q=KS-E2E");
  await page.getByRole("button", { name: "E2E Test Balatası sil" }).first().click();
  await page.getByRole("button", { name: "Ürünü sil" }).click();
  await expect(page.getByRole("heading", { name: "Bu filtrelere uyan ürün yok" })).toBeVisible();
  await expectNoMobileOverflow(page);

  await page.goto("/products/e2e-test-balatasi");
  await expect(page.getByRole("heading", { name: "Ürün bulunamadı" })).toBeVisible();
});

test("admin edits a hero slide and the campaign bar", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("E-posta").fill("admin@kursatshop.demo");
  await page.getByLabel("Şifre").fill("demo1234");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page.getByRole("heading", { name: "Gösterge paneli" })).toBeVisible();

  await page.goto("/admin/home");
  await expect(page.getByRole("heading", { name: "Ana sayfa vitrini" })).toBeVisible();
  await page.getByRole("button", { name: "Düzenle: Doğru parça, ilk seferde" }).click();
  await page.locator("#slide-title").fill("Kış bakımı başladı");
  await page.locator("#slide-ctaHref").fill("//evil.example");
  await page.getByRole("button", { name: "Slaytı kaydet" }).click();
  await expect(page.getByText("Bağlantı site içi olmalı ve / ile başlamalı.")).toBeVisible();
  await page.locator("#slide-ctaHref").fill("/garage");
  await page.getByRole("button", { name: "Slaytı kaydet" }).click();
  await expect(page.getByText("Slayt kaydedildi.")).toBeVisible();

  await page.locator("#announcement-text").fill("Demo kampanya metni");
  await page.getByRole("button", { name: "Şeridi kaydet" }).click();
  await expect(page.getByText("Kampanya şeridi kaydedildi.")).toBeVisible();
  await expectNoMobileOverflow(page);

  await page.goto("/");
  await expect(page.locator('section[aria-roledescription="carousel"]')).toContainText("Kış bakımı başladı");
  await expect(page.getByText("Demo kampanya metni")).toBeVisible();
});
