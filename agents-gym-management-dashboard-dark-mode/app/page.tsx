import { redirect } from "next/navigation";

/**
 * Root Page — Redirects to /login by default.
 */
export default function RootPage() {
  redirect("/login");
}