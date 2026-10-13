import { expect, expectNoMobileOverflow, test } from "./fixtures";

test("404 page offers search and category shortcuts", async ({ page }) => {
  const response = await page.goto("/bu-sayfa-yok");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Sayfa bulunamadı" })).toBeVisible();
  await expect(page.getByRole("combobox").first()).toBeVisible();
  for (const name of ["OEM Parçalar", "Performans", "Bakım & Temizlik"]) {
    await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  }
  await expectNoMobileOverflow(page);
});

test("admin shows its own not-found screens inside the panel", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("E-posta").fill("admin@kursatshop.demo");
  await page.getByLabel("Şifre").fill("demo1234");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page.getByRole("heading", { name: "Gösterge paneli" })).toBeVisible();

  await page.goto("/admin/products/yok/edit");
  await expect(page.getByText("Bu kayıt bulunamadı veya silinmiş.").filter({ visible: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ürünlere dön" }).filter({ visible: true })).toBeVisible();

  await page.goto("/admin/olmayan-sayfa");
  await expect(page.getByRole("heading", { name: "Sayfa bulunamadı" }).filter({ visible: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: /Yönetim/ })).toBeVisible();
});
