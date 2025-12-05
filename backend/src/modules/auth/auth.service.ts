import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import * as bcrypt from "bcrypt";
import { Employee } from "../../entities/employee.entity";
import { Position } from "../../entities/position.entity";
import { PositionPermission } from "../../entities/position-permission.entity";
import { Permission } from "../../entities/permission.entity";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,

    @InjectRepository(Position)
    private positionRepo: Repository<Position>,

    @InjectRepository(PositionPermission)
    private ppRepo: Repository<PositionPermission>,

    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>
  ) {}

  // --- HÀM HELPER: Lấy danh sách quyền hạn ---
  private async getUserPermissions(positionId: number): Promise<string[]> {
    if (!positionId) return [];

    // Cách 1: Giữ nguyên cách của bạn (An toàn nếu chưa config Relation chuẩn)
    // Cách này tuy 2 query nhưng rất rõ ràng và dễ debug.
    const pps = await this.ppRepo.find({
      where: { position_id: positionId },
    });

    if (!pps.length) return [];

    const permIds = pps.map((pp) => pp.permission_id);

    const perms = await this.permissionRepo.find({
      where: { permission_id: In(permIds) },
    });

    return perms.map((p) => p.permission_name);
  }

  // --- LOGIC CHÍNH ---

  async updateContactInfo(
    userId: number,
    data: { phone_number: string; address: string }
  ) {
    // 1. Update
    await this.employeeRepo.update(
      { employee_id: userId },
      {
        phone_number: data.phone_number,
        address: data.address,
      }
    );

    // 2. Return fresh data (Quan trọng để UI cập nhật ngay lập tức)
    return this.getProfile(userId);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.employeeRepo.findOne({
      where: { email },
      relations: ["position"],
    });

    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;

    const permissions = user.position
      ? await this.getUserPermissions(user.position.position_id)
      : [];

    const { password, ...rest } = user;
    return { ...rest, permissions };
  }

  async getProfile(employee_id: number): Promise<any> {
    // Luôn lấy dữ liệu mới nhất từ DB
    const user = await this.employeeRepo.findOne({
      where: { employee_id },
      relations: ["position", "department"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const permissions = user.position
      ? await this.getUserPermissions(user.position.position_id)
      : [];

    const { password, ...rest } = user;
    return { ...rest, permissions };
  }

  async login(user: any) {
    const payload = {
      sub: user.employee_id,
      email: user.email,
      // Thêm role vào token nếu cần verify nhanh ở Guard mà không cần query DB
      role: user.position?.position_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerAdminUser(data: {
    email: string;
    password: string;
    role: "Admin" | "Developer";
    secretKey: string;
  }) {
    const { email, password, role, secretKey } = data;
    console.log("Current Env Key:", process.env.ADMIN_SECRET_KEY); // <--- Thêm dòng này để kiểm tra
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (!expectedKey) {
      throw new UnauthorizedException("Admin registration is disabled");
    }

    if (secretKey !== expectedKey) {
      throw new UnauthorizedException("Invalid system secret key");
    }

    if (!["Admin", "Developer"].includes(role)) {
      throw new BadRequestException("Invalid role selected");
    }
    const existing = await this.employeeRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException("Email already exists");
    }

    let position = await this.positionRepo.findOne({
      where: { position_name: role },
    });

    if (!position) {
      // Bootstrap: create missing position if it does not exist yet
      position = this.positionRepo.create({ position_name: role });
      position = await this.positionRepo.save(position);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = this.employeeRepo.create({
      email,
      password: hashedPassword,
      first_name: role, // minimal defaults for required fields
      last_name: "User",
      position,
    });

    const saved = await this.employeeRepo.save(employee);

    // Return a fresh profile with relations and without password
    return this.getProfile(saved.employee_id);
  }
}
