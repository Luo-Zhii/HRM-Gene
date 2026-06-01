import { useAuth } from "@/hooks/useAuth";

export function useCheckPermission() {
  const { user } = useAuth();

  const checkPermission = (method: string, apiPath: string): boolean => {
    if (!user) return false;

    const positionName = user.role || user.position?.position_name || "";
    const roleLower = positionName.toLowerCase();
    // Admin / System Admin Bypass (matches backend EndpointPermissionsGuard)
    if (
      roleLower === "admin" ||
      roleLower === "system admin" ||
      user.email === "admin@example.com"
    ) {
      return true;
    }

    const permissions = user.permissions || [];
    const requiredString = `${method}:${apiPath}`;

    return permissions.some((perm: any) => {
      // Handle flat string format from JWT strategy
      if (typeof perm === "string") {
        return perm === requiredString;
      }
      // Handle object format (if nested objects are injected instead of strings)
      if (typeof perm === "object" && perm !== null) {
        return perm.method === method && perm.apiPath === apiPath;
      }
      return false;
    });
  };

  return { checkPermission };
}
