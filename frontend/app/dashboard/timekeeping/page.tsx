import { redirect } from "next/navigation";

export default function DashboardTimekeepingRedirect() {
  // The app uses a route group `(dashboard)` so the real timekeeping route is `/timekeeping`.
  // This file provides a compatibility path `/dashboard/timekeeping` that redirects to `/timekeeping`.
  redirect("/timekeeping");
}
