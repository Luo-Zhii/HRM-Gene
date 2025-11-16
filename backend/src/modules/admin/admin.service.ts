import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompanySettings } from "../../entities/company-settings.entity";
import { Department } from "../../entities/department.entity";
import { Position } from "../../entities/position.entity";
import { Permission } from "../../entities/permission.entity";
import { PositionPermission } from "../../entities/position-permission.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(CompanySettings)
    private settingsRepo: Repository<CompanySettings>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(Position) private positionRepo: Repository<Position>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(PositionPermission)
    private posPermRepo: Repository<PositionPermission>
  ) {}

  // ============= System Settings =============
  async getAllSettings() {
    return this.settingsRepo.find();
  }

  async getSetting(key: string) {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    return setting || { key, value: "" };
  }

  async updateSetting(key: string, value: string) {
    let setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingsRepo.create({ key, value });
    } else {
      setting.value = value;
    }
    return this.settingsRepo.save(setting);
  }

  // ============= Department Management =============
  async getAllDepartments() {
    return this.deptRepo.find({ relations: ["manager", "employees"] });
  }

  async createDepartment(departmentName: string) {
    if (!departmentName) {
      throw new BadRequestException("Department name is required");
    }
    const dept = this.deptRepo.create({ department_name: departmentName });
    return this.deptRepo.save(dept);
  }

  // ============= Position Management =============
  async getAllPositions() {
    return this.positionRepo.find({
      relations: ["permissions", "permissions.permission"],
    });
  }

  async createPosition(positionName: string) {
    if (!positionName) {
      throw new BadRequestException("Position name is required");
    }
    const pos = this.positionRepo.create({ position_name: positionName });
    return this.positionRepo.save(pos);
  }

  // ============= Permission Management =============
  async getPermissionMatrix() {
    const positions = await this.positionRepo.find({
      relations: ["permissions", "permissions.permission"],
    });

    const matrix = positions.map((position) => ({
      position_id: position.position_id,
      position_name: position.position_name,
      permissions: (position.permissions || []).map((pp) => ({
        permission_id: pp.permission.permission_id,
        permission_name: pp.permission.permission_name,
      })),
    }));

    return matrix;
  }

  async assignPermissionToPosition(positionId: number, permissionId: number) {
    // Verify position and permission exist
    const position = await this.positionRepo.findOne({
      where: { position_id: positionId },
    });
    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    const permission = await this.permissionRepo.findOne({
      where: { permission_id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`
      );
    }

    // Check if assignment already exists
    const existing = await this.posPermRepo.findOne({
      where: { position_id: positionId, permission_id: permissionId },
    });

    if (existing) {
      throw new BadRequestException(
        `Permission ${permissionId} is already assigned to position ${positionId}`
      );
    }

    // Create the assignment
    const assignment = this.posPermRepo.create({
      position_id: positionId,
      permission_id: permissionId,
    });

    return this.posPermRepo.save(assignment);
  }

  async revokePermissionFromPosition(positionId: number, permissionId: number) {
    // Verify position and permission exist
    const position = await this.positionRepo.findOne({
      where: { position_id: positionId },
    });
    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    const permission = await this.permissionRepo.findOne({
      where: { permission_id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`
      );
    }

    // Check if assignment exists
    const assignment = await this.posPermRepo.findOne({
      where: { position_id: positionId, permission_id: permissionId },
    });

    if (!assignment) {
      throw new BadRequestException(
        `Permission ${permissionId} is not assigned to position ${positionId}`
      );
    }

    // Delete the assignment
    await this.posPermRepo.remove(assignment);

    return { message: "Permission revoked successfully" };
  }
}
