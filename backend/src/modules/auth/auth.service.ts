import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Employee } from "../../entities/employee.entity";
import { PositionPermission } from "../../entities/position-permission.entity";
import { Permission } from "../../entities/permission.entity";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(PositionPermission)
    private ppRepo?: Repository<PositionPermission>,
    @InjectRepository(Permission)
    private permissionRepo?: Repository<Permission>
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.employeeRepo.findOne({
      where: { email } as any,
      relations: ["position"],
    } as any);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;

    // load permissions for user's position
    let permissions: string[] = [];
    if (user.position && this.ppRepo && this.permissionRepo) {
      const pps = await this.ppRepo.find({
        where: { position_id: user.position.position_id } as any,
      } as any);
      const permIds = pps.map((x: any) => x.permission_id);
      const perms = await this.permissionRepo.findByIds(permIds as any);
      permissions = perms.map((p: any) => p.permission_name);
    }

    const { password, ...rest } = user as any;
    return { ...rest, permissions };
  }

  async getProfile(employee_id: number): Promise<any> {
    const user = await this.employeeRepo.findOne({
      where: { employee_id } as any,
      relations: ["position"],
    } as any);
    if (!user) return null;

    // load permissions for user's position
    let permissions: string[] = [];
    if (user.position && this.ppRepo && this.permissionRepo) {
      const pps = await this.ppRepo.find({
        where: { position_id: user.position.position_id } as any,
      } as any);
      const permIds = pps.map((x: any) => x.permission_id);
      const perms = await this.permissionRepo.findByIds(permIds as any);
      permissions = perms.map((p: any) => p.permission_name);
    }

    const { password, ...rest } = user as any;
    return { ...rest, permissions };
  }

  async login(user: any) {
    const payload = {
      sub: user.employee_id,
      email: user.email,
      positionId: user.position?.position_id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
