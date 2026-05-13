import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRE_PERMISSIONS_KEY } from "./require-permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<{ module: string; action: string }>(
      REQUIRE_PERMISSIONS_KEY,
      context.getHandler()
    );

    if (!requiredPermission) {
      return true; // No specific permissions required
    }

    const { user } = context.switchToHttp().getRequest();
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
      positionName.toLowerCase() === "admin"
    ) {
      return true;
    }

    // user.permissions is a string array like ['COMPANIES:READ', 'USERS:CREATE']
    const userPermissions = user.permissions || [];
    
    // Support wildcard module matches or exact match
    const requiredString = `${requiredPermission.module}:${requiredPermission.action}`;
    const requiredModuleAdmin = `${requiredPermission.module}:MANAGE`;

    const hasPermission = userPermissions.some(
      (perm: string) => perm === requiredString || perm === requiredModuleAdmin
    );

    if (!hasPermission) {
      console.log(`⛔ Access Denied! User: ${user.email}`);
      console.log(`   Required: ${requiredString}`);
      console.log(`   User Has: ${JSON.stringify(userPermissions)}`);
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
