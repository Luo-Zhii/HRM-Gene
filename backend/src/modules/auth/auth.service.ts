import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm"; // Thêm In để query mảng ID
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
    private ppRepo: Repository<PositionPermission>, // Bỏ dấu ? để bắt buộc inject

    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission> // Bỏ dấu ? để bắt buộc inject
  ) {}

  // --- HÀM HELPER: Lấy danh sách quyền hạn (Tránh lặp code) ---
  private async getUserPermissions(positionId: number): Promise<string[]> {
    if (!positionId) return [];

    // 1. Tìm các permission_id dựa trên position_id
    const pps = await this.ppRepo.find({
      where: { position_id: positionId },
    });

    if (!pps.length) return [];

    const permIds = pps.map((pp) => pp.permission_id);

    // 2. Tìm chi tiết Permission dựa trên danh sách ID
    const perms = await this.permissionRepo.find({
      where: { permission_id: In(permIds) }, // Dùng toán tử In của TypeORM
    });

    return perms.map((p) => p.permission_name);
  }

  // --- LOGIC CHÍNH ---

  async updateContactInfo(
    userId: number,
    data: { phone_number: string; address: string }
  ) {
    // 1. Cập nhật bằng TypeORM (update không trả về data mới ngay lập tức)
    await this.employeeRepo.update(
      { employee_id: userId },
      {
        phone_number: data.phone_number,
        address: data.address,
      }
    );

    // 2. Gọi lại hàm getProfile để trả về dữ liệu mới nhất cho Frontend
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

    // Sử dụng hàm helper đã tách ra
    const permissions = user.position
      ? await this.getUserPermissions(user.position.position_id)
      : [];

    const { password, ...rest } = user;
    return { ...rest, permissions };
  }

  async getProfile(employee_id: number): Promise<any> {
    const user = await this.employeeRepo.findOne({
      where: { employee_id },
      relations: ["position", "department"], // Thêm department nếu cần hiển thị phòng ban
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Sử dụng hàm helper đã tách ra
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
      positionId: user.position?.position_id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
