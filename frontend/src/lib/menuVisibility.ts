export interface MenuItem {
  name: string;
  href: string;
  roles?: string[];
  departments?: string[];
  icon?: any;
  items?: MenuItem[];
  [key: string]: any;
}

/**
 * Reusable utility to check if a menu item should be visible to a user.
 * 
 * Visibility Rules:
 * 1. Director / System Admin bypass all checks (always visible).
 * 2. Department Priority: If user's department matches item's `departments`, visible regardless of role.
 * 3. Functional Segregation: If user is in a core functional department (HR, Finance) not matched in step 2,
 *    they are excluded from seeing the menu (e.g. HR Manager cannot see Finance-only menus).
 * 4. Role Fallback: If user is in a general department (e.g. Sales), they can see the menu if their role matches.
 */
export function checkMenuVisibility(user: any, menuItem: MenuItem): boolean {
  if (!user) return false;

  // Extract role and department case-insensitively
  const userRole = (user.role || user.position?.position_name || "").toLowerCase();
  const userDept = (
    typeof user.department === "string"
      ? user.department
      : user.department?.department_name || ""
  ).toLowerCase();

  // Rule 1: Director or System Admin bypasses all checks
  if (userRole === "director" || userRole === "system admin" || userRole === "admin") {
    return true;
  }

  // Define known core functional departments that require strict segregation
  const FUNCTIONAL_DEPARTMENTS = ["hr", "finance"];

  // Check if departments are configured for this menu item
  if (menuItem.departments && menuItem.departments.length > 0) {
    const menuItemDepts = menuItem.departments.map((d) => d.toLowerCase());

    // Rule 2: Department-based Priority (Functional Scoping)
    if (menuItemDepts.includes(userDept)) {
      return true;
    }

    // Rule 3: Exclude users from unauthorized functional departments
    if (FUNCTIONAL_DEPARTMENTS.includes(userDept)) {
      return false;
    }
  }

  // Rule 4: Role-based fallback
  if (menuItem.roles && menuItem.roles.length > 0) {
    const menuItemRoles = menuItem.roles.map((r) => r.toLowerCase());
    return menuItemRoles.includes(userRole);
  }

  // Default: Show if neither roles nor departments are specified
  return true;
}

/**
 * Example Menu Configuration array demonstrating hybrid role + department scoping.
 */
export const menuItems: MenuItem[] = [
  {
    name: "Payroll",
    href: "/admin/payroll",
    // Finance Staff/Managers MUST see Payroll.
    // Core functional segregation blocks HR/others from fallback access.
    departments: ["Finance"],
    roles: ["Director"], // Only Director (bypass/fallback) sees it from outside Finance.
  },
  {
    name: "People",
    href: "/admin/employees",
    // HR Staff/Managers MUST see People.
    // Fallback: Managers from general departments (e.g., Sales Manager) can see it too.
    departments: ["HR"],
    roles: ["Manager"],
  },
];
