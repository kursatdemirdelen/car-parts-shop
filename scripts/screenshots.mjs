// Captures README screenshots with Playwright.
// Usage: node scripts/screenshots.mjs [baseUrl]   (default: the live demo)
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = (process.argv[2] ?? "https://car-parts-shop-flame.vercel.app").replace(/\/$/, "");
const out = "docs/media";
await mkdir(out, { recursive: true });

const browser = await chromium.launch();

async function shoot(name, path, { width = 1440, height = 900, storage = {}, before } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, locale: "tr-TR" });
  const page = await context.newPage();
  await page.goto(base + "/");
  await page.evaluate((s) => {
    localStorage.clear();
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v));
  }, storage);
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (before) await before(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png` });
  await context.close();
  console.log(`saved ${out}/${name}.png`);
}

const g20 = { "ks:v1:garage": { saved: ["v-bmw-g20-320i"], selected: "v-bmw-g20-320i" } };
const e46 = { "ks:v1:garage": { saved: ["v-bmw-e46-320d"], selected: "v-bmw-e46-320d" } };

await shoot("home", "/");
await shoot("product", "/products/brembo-on-fren-balatasi-g20", { storage: g20 });
await shoot("vehicle", "/arac/bmw-e46-320d", { storage: e46 });
await shoot("vin", "/sasi-sorgula", {
  before: async (page) => {
    await page.getByRole("button", { name: "Örnek ile dene" }).click();
    await page.getByText("Çözüldü: BMW").scrollIntoViewIfNeeded();
  },
});
const ago = (months) => {
  const d = new Date();
  d.setDate(Math.min(d.getDate(), 28));
  d.setMonth(d.getMonth() - months);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
await shoot("maintenance", "/garage", {
  storage: {
    "ks:v1:garage": { saved: ["v-bmw-f30-320d"], selected: "v-bmw-f30-320d" },
    "ks:v1:maintenance": {
      "v-bmw-f30-320d": {
        odometer: { km: 121500, updatedAt: ago(0) },
        log: [
          { id: "s1", itemId: "engine-oil", date: ago(23), km: 97000 },
          { id: "s2", itemId: "brake-fluid", date: ago(26), km: 92000 },
          { id: "s3", itemId: "air-filter", date: ago(23), km: 97000 },
        ],
      },
    },
  },
  before: async (page) => {
    await page.getByText("Bakım takvimi").first().scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 180));
  },
});
await shoot("admin-products", "/admin/products", { storage: { "ks:v1:admin": true } });
await shoot("mobile-listing", "/categories/fren-sistemi", { width: 390, height: 844, storage: e46 });

await browser.close();
