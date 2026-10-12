import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Kursat Shop — Aracına uygun yedek parça",
    template: "%s · Kursat Shop",
  },
  description:
    "BMW, Mercedes-Benz, Porsche ve Audi için OEM yedek parça, performans ve bakım ürünleri. Demo prototip.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
