import { expect, expectNoMobileOverflow, test } from "./fixtures";

test("demo checkout validates input and creates an order", async ({ page }) => {
  await page.goto("/products/brembo-on-fren-balatasi-g20");
  await page.getByRole("button", { name: "Sepete ekle" }).first().click();
  await page.goto("/cart");
  await page.getByRole("button", { name: "Adedi artır" }).first().click();
  await expect(page.getByLabel("Adet").first()).toHaveValue("2");
  await expectNoMobileOverflow(page);

  await page.getByRole("link", { name: "Ödemeye geç" }).click();
  await expect(page.getByText("demo ödeme sayfasıdır")).toBeVisible();
  await page.locator("#checkout-fullName").fill("Demo Test");
  await page.locator("#checkout-email").fill("demo@");
  await page.locator("#checkout-phone").fill("+90 532 111 22 33");
  await page.locator("#checkout-city").fill("İstanbul");
  await page.locator("#checkout-district").fill("Kadıköy");
  await page.locator("#checkout-line").fill("Demo Sk. No: 1");
  await page.getByRole("button", { name: "Siparişi tamamla (demo)" }).click();
  await expect(page.getByText("Geçerli bir e-posta adresi girin.")).toBeVisible();
  await expect(page.locator("#checkout-email")).toBeFocused();

  await page.locator("#checkout-email").fill("demo@ornek.test");
  await page.getByRole("button", { name: "Siparişi tamamla (demo)" }).click();
  await expect(page).toHaveURL(/\/order-success\?ref=KS-/);
  await expect(page.getByRole("heading", { name: "Demo siparişin oluşturuldu" })).toBeVisible();
  await expect(page.getByText(/^KS-\d{6}-[A-Z0-9]{4}$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Sepet (0 ürün)" })).toBeVisible();
  await expectNoMobileOverflow(page);
});
