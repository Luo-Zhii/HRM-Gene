import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./permissions.decorator";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PositionPermission } from "../../entities/position-permission.entity";
import { Permission } from "../../entities/permission.entity";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(PositionPermission)
    private ppRepo?: Repository<PositionPermission>,
    @InjectRepository(Permission)
    private permissionRepo?: Repository<Permission>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException("Unauthorized");

    // Load permissions for user's position
    let userPermissions: string[] = [];
    if (user.positionId && this.ppRepo && this.permissionRepo) {
      const pps = await this.ppRepo.find({
        where: { position_id: user.positionId } as any,
      } as any);
      const permIds = pps.map((x: any) => x.permission_id);
      const perms = await this.permissionRepo.findByIds(permIds as any);
      userPermissions = perms.map((p: any) => p.permission_name);
    }

    const ok = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!ok) throw new ForbiddenException("Insufficient permissions");
    return true;
  }
}
