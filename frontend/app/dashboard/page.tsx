import { redirect } from "next/navigation";

export default function DashboardLanding() {
  // Many places in the frontend redirect to /dashboard — send that to a sensible default
  redirect("/accounting");
}
