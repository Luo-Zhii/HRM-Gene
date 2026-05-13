import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class EndpointPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user, method, route, originalUrl } = request;

    if (!user) {
      throw new ForbiddenException("Unauthenticated user");
    }

    // ============================================================
    // 🚀 ADMIN BYPASS
    // ============================================================
    const positionName = user.position?.position_name || user.role || "";

    if (
      positionName === "Admin" ||
      positionName === "System Admin" ||
      positionName === "Director" ||
      positionName.toLowerCase() === "admin" ||
      user.email === "admin@example.com"
    ) {
      return true;
    }

    // Identify the exact path, falling back to originalUrl if route is somehow missing
    // Next.js might rewrite URLs, but inside NestJS route.path should be exact
    const apiPath = route?.path || originalUrl;

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
