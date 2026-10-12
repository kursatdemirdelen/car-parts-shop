import { expect, expectNoMobileOverflow, test } from "./fixtures";

/** Local calendar date `months` before today, as YYYY-MM-DD (day clamped to 28 to stay valid). */
function monthsAgo(months: number): string {
  const d = new Date();
  d.setDate(Math.min(d.getDate(), 28));
  d.setMonth(d.getMonth() - months);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

test("maintenance reminder flags overdue oil and recommends fitting parts", async ({ page }) => {
  await page.goto("/garage");
  const selector = page.locator("form").filter({ has: page.getByRole("button", { name: "Garaja ekle ve seç" }) });
  const selects = selector.locator("select");
  await selects.nth(0).selectOption("BMW");
  await selects.nth(1).selectOption("3 Serisi");
  await selects.nth(2).selectOption("F30");
  await selects.nth(3).selectOption("2016");
  await selects.nth(4).selectOption("v-bmw-f30-320d");
  await selector.getByRole("button", { name: "Garaja ekle ve seç" }).click();

  await page.getByText("Bakım takvimi").click(); // collapsed until something is due
  await page.locator("#odo-v-bmw-f30-320d").fill("120.000");
  await page.getByRole("button", { name: "Kaydet" }).first().click();
  await expect(page.getByText("Son güncelleme:")).toBeVisible();

  // BMW LongLife oil interval is 2 years, so 25 months ago is overdue.
  const oil = page.locator('li[data-item="engine-oil"]');
  await oil.getByRole("button", { name: "Son değişimi gir" }).click();
  await page.locator("#svc-date-v-bmw-f30-320d-engine-oil").fill(monthsAgo(25));
  await page.locator("#svc-km-v-bmw-f30-320d-engine-oil").fill("100000");
  await oil.getByRole("button", { name: "Kaydet" }).click();
  await expect(oil.getByText("Gecikti", { exact: true })).toBeVisible();

  await oil.getByRole("button", { name: "Sepete ekle" }).first().click();
  await expect(page.getByRole("link", { name: /Sepet \(1 ürün\)/ })).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("BMW F30 320d: 1 bakım gecikti")).toBeVisible();
  await expect(page.getByRole("link", { name: /gecikmiş bakım var/ }).first()).toBeVisible();

  await page.goto("/garage");
  await page.getByRole("button", { name: "Motor yağı + yağ filtresi: bugün yaptım" }).click();
  await expect(page.locator('li[data-item="engine-oil"]').getByText("Zamanı var", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Son bakımlar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Motor yağı + yağ filtresi kaydını sil" })).toHaveCount(2);
  await expectNoMobileOverflow(page);
});
