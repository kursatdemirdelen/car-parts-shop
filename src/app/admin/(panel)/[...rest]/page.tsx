import { notFound } from "next/navigation";

/** Unknown admin URLs render the admin not-found screen inside the panel layout. */
export default function Page() {
  notFound();
}
