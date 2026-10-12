import type { Metadata } from "next";
import { FavoritesPage } from "@/components/store/FavoritesPage";

export const metadata: Metadata = { title: "Favoriler" };

export default function Page() {
  return <FavoritesPage />;
}
