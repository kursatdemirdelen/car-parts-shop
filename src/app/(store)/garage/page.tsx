import type { Metadata } from "next";
import { GaragePage } from "@/components/store/GaragePage";

export const metadata: Metadata = { title: "Garajım" };

export default function Page() {
  return <GaragePage />;
}
