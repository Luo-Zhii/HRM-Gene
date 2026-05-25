import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class EndpointPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user, method, route, originalUrl } = request;

    if (!user) {
      throw new ForbiddenException("Unauthenticated user");
    }

    // ============================================================
    // 🚀 ADMIN BYPASS
    // ============================================================
    const positionName = (user.position?.position_name || user.role || "").toLowerCase();
    const deptName = (user.department?.department_name || "").toLowerCase();

    // Admin / System Admin bypass - case-insensitive
    const bypassRoles = ["admin", "system admin"];
    if (
      bypassRoles.some(role => positionName === role || positionName.includes(role)) ||
      user.email === "admin@example.com"
    ) {
      return true;
    }

    // Identify the exact path, falling back to originalUrl if route is somehow missing
    // Next.js might rewrite URLs, but inside NestJS route.path should be exact
    const apiPath = route?.path || originalUrl || "";

    // Department-based functional bypass
    // 1. Finance department always has access to all payroll routes
    if (deptName.includes("finance") && (apiPath.includes("/payroll") || apiPath.includes("/api/payroll"))) {
      return true;
    }
    // 2. HR department always has access to employee, leave, contract, attendance routes
    if (deptName.includes("hr") && (
      apiPath.includes("/employee") ||
      apiPath.includes("/leave") ||
      apiPath.includes("/contract") ||
      apiPath.includes("/attendance") ||
      apiPath.includes("/organization")
    )) {
      return true;
    }

    // Allow all authenticated users to read general settings (such as sidebar visibility)
    if (method === "GET" && (apiPath.includes("/admin/settings/") || apiPath.includes("/admin/settings/:key"))) {
      return true;
    }

    // user.permissions is a string array like ['GET:/api/v1/companies', 'POST:/api/admin/users']
    const userPermissions = user.permissions || [];
    
    // Exact endpoint matching: METHOD:PATH
    const requiredString = `${method}:${apiPath}`;

    const hasPermission = userPermissions.some(
      (perm: string) => perm === requiredString
    );

    if (!hasPermission) {
      console.log(`⛔ Endpoint Access Denied! User: ${user.email}`);
      console.log(`   Required: ${requiredString}`);
      console.log(`   User Has: ${JSON.stringify(userPermissions)}`);
      throw new ForbiddenException("Insufficient permissions for this endpoint");
    }

    return true;
  }
}
