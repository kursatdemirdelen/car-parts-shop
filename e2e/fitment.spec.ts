import { expect, expectNoMobileOverflow, test } from "./fixtures";

test("selecting a vehicle shows only confirmed or universal parts", async ({ page }) => {
  await page.goto("/");
  const selector = page.locator("form").filter({ has: page.getByRole("button", { name: "Parçaları göster" }) });
  const selects = selector.locator("select");
  await selects.nth(0).selectOption("BMW");
  await selects.nth(1).selectOption("3 Serisi");
  await selects.nth(2).selectOption("E46");
  await selects.nth(3).selectOption("2003");
  await selects.nth(4).selectOption("v-bmw-e46-320d");
  await selector.getByRole("button", { name: "Parçaları göster" }).click();

  await expect(page).toHaveURL(/\/products\?fit=1/);
  const b12 = page.locator("article:visible").filter({ hasText: "B12 Pro-Kit Süspansiyon Seti" });
  await expect(b12.getByText("Doğrulanmış uyum")).toBeVisible();
  await expect(page.locator("article:visible").filter({ hasText: "Ön Fren Balatası Seti" })).toHaveCount(0);
  await expect(page.locator("article:visible").getByText("Doğrulanmamış")).toHaveCount(0);
  await expectNoMobileOverflow(page);
});

test("vehicle landing page lists confirmed parts and a kit", async ({ page }) => {
  await page.goto("/arac/bmw-e46-320d");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("E46");
  await expect(page.getByRole("heading", { name: "E46 320d periyodik bakım seti" })).toBeVisible();
  await page.getByRole("button", { name: "Seti sepete ekle" }).click();
  await expect(page.getByRole("link", { name: /Sepet \(3 ürün\)/ })).toBeVisible();
  await expectNoMobileOverflow(page);
});
