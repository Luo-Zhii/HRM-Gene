import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect root to login by default
  redirect("/login");
}
