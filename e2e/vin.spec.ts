import { expect, expectNoMobileOverflow, test } from "./fixtures";

test("VIN explainer decodes the example and selects a vehicle", async ({ page }) => {
  await page.goto("/sasi-sorgula");
  await page.getByRole("button", { name: "Örnek ile dene" }).click();
  await expect(page.getByText("Çözüldü: BMW")).toBeVisible();
  await expect(page.getByText("Tahmin: 2005")).toBeVisible();
  await expect(page.getByText(/bu demoda çözülmez/)).toBeVisible();
  await expectNoMobileOverflow(page);

  await page.getByRole("button", { name: /E46 · 320d/ }).click();
  await expect(page).toHaveURL(/\/products\?fit=1/);
  await expect(page.getByText("BMW 3 Serisi E46 · 320d 2.0 (150 HP)").first()).toBeVisible();
});

test("VIN input rejects I, O and Q", async ({ page }) => {
  await page.goto("/sasi-sorgula");
  await page.getByLabel(/Şasi numarası \(17 karakter\)/).fill("WBAEV33O35KR12345");
  await page.getByRole("button", { name: "Çözümle" }).click();
  await expect(page.getByText("Şasi numarasında I, O ve Q harfleri bulunmaz; lütfen kontrol edin.")).toBeVisible();
});
