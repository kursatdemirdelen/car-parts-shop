import { expect, expectNoMobileOverflow, test } from "./fixtures";

test("finds a part by an OEM number typed with spaces", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("combobox", { name: /OEM numarası veya stok kodu ara/ }).first();
  await search.fill("34 11 6 860 912");
  await page.getByRole("option", { name: /Ön Fren Balatası Seti/ }).click();
  await expect(page).toHaveURL(/\/products\/brembo-on-fren-balatasi-g20$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ön Fren Balatası Seti");
  await expectNoMobileOverflow(page);
});

test("shows a helpful empty state for an unknown query", async ({ page }) => {
  await page.goto("/search?q=zzzz");
  await expect(page.getByRole("heading", { name: "Sonuç bulunamadı" })).toBeVisible();
  await expectNoMobileOverflow(page);
});
