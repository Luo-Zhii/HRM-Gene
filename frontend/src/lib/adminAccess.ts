/**
 * Central admin access helper.
 *
 * Rule: Director is the highest rank. Director, Admin, System Admin, HR Manager, HR
 * must BYPASS all frontend permission guards for admin pages.
 *
 * This replaces scattered `user.permissions?.includes("manage:system")` checks
 * with a role-aware function that prioritises position_name over legacy permission strings.
 */

const ADMIN_BYPASS_ROLES = [
  "admin",
  "system admin",
  "director",
  "hr manager",
  "hr",
];

type User = {
  position?: { position_name?: string };
  role?: string;
  permissions?: string[];
  email?: string;
} | null | undefined;

/** Returns the normalised position name for this user */
export function getPositionName(user: User): string {
  return (
    user?.position?.position_name?.toLowerCase() ??
    user?.role?.toLowerCase() ??
    ""
  );
}

/** TRUE if user is a Director / Admin / HR — bypasses all frontend guards */
export function isAdminBypassRole(user: User): boolean {
  const pos = getPositionName(user);
  return ADMIN_BYPASS_ROLES.some(r => pos === r || pos.includes(r));
}

// ── Specific guards ────────────────────────────────────────────────────────

/** Can manage system settings (Company Settings, QR, etc.) */
export function canManageSystem(user: User): boolean {
  if (isAdminBypassRole(user)) return true;
  return (
    !!user?.permissions?.includes("manage:system") ||
    !!user?.permissions?.includes("PATCH:/api/admin/settings") ||
    !!user?.permissions?.includes("GET:/api/admin/company/settings")
  );
}

/** Can manage payroll */
export function canManagePayroll(user: User): boolean {
  if (isAdminBypassRole(user)) return true;
  return (
    !!user?.permissions?.includes("manage:payroll") ||
    !!user?.permissions?.includes("GET:/api/admin/payroll")
  );
}

/** Can view/edit RBAC permissions */
export function canManagePermissions(user: User): boolean {
  if (isAdminBypassRole(user)) return true;
  return (
    !!user?.permissions?.includes("manage:system") ||
    !!user?.permissions?.includes("GET:/api/admin/permissions/grouped") ||
    !!user?.permissions?.includes("PUT:/api/admin/roles/:id/permissions")
  );
}

/** Can manage leave (approvals, holidays) */
export function canManageLeave(user: User): boolean {
  if (isAdminBypassRole(user)) return true;
  return (
    !!user?.permissions?.includes("manage:leave") ||
    !!user?.permissions?.includes("GET:/api/admin/leave")
  );
}

/** Can manage employees / HR directory */
export function canManageEmployees(user: User): boolean {
  if (isAdminBypassRole(user)) return true;
  return (
    !!user?.permissions?.includes("manage:hr") ||
    !!user?.permissions?.includes("GET:/api/admin/employees")
  );
}

/** Can manage reports / analytics */
export function canManageReports(user: User): boolean {
  if (isAdminBypassRole(user)) return true;
  return canManageSystem(user) || canManagePayroll(user);
}
