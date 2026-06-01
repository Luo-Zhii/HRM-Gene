import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect root to dashboard by default
  redirect("/dashboard");
}
