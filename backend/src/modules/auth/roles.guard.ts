import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./permissions.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy danh sách quyền yêu cầu từ Decorator @Permissions(...)
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Nếu API không yêu cầu quyền gì -> Cho qua
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 2. Lấy User từ Request
    const request = context.switchToHttp().getRequest();
    const { user, route, originalUrl } = request;
    if (!user) {
      throw new ForbiddenException("Unauthenticated user");
    }

    // ============================================================
    // 🚀 QUAN TRỌNG: ADMIN BYPASS (Thẻ bài miễn tử)
    // Nếu là Admin, cho phép truy cập ngay lập tức, bỏ qua check quyền
    // ============================================================
    const positionName = (user.position?.position_name || user.role || "").toLowerCase();
    const deptName = (user.department?.department_name || "").toLowerCase();

    // Admin / Director / HR Manager bypass - cho phép toàn quyền
    const bypassRoles = ["admin", "system admin", "director", "hr manager", "hr"];
    if (bypassRoles.some(role => positionName === role || positionName.includes(role))) {
      return true;
    }

    // Department-based functional bypass
    const apiPath = route?.path || originalUrl || "";
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

    // 3. Logic check quyền cho nhân viên thường
    // user.permissions được lấy từ JwtStrategy (đã gộp sẵn ở bước Login/Validate)
    const userPermissions = user.permissions || [];

    // Kiểm tra: User có chứa ít nhất một quyền trong danh sách yêu cầu hay không
    // (Dùng .some() linh hoạt hơn .every())
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      // Log ra để debug nếu bị lỗi 403
      console.log(`⛔ Access Denied! User: ${user.email}`);
      console.log(`   Required: ${JSON.stringify(requiredPermissions)}`);
      console.log(`   User Has: ${JSON.stringify(userPermissions)}`);

      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
