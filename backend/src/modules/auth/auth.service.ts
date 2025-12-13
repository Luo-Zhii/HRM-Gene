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
import "dotenv/config";
import { Department } from "@/entities/department.entity";
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,

    @InjectRepository(Position)
    private positionRepo: Repository<Position>,

    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,

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

  async updateContactInfo(id: number, data: any) {
    const employee = await this.employeeRepo.findOne({
      where: { employee_id: id },
      relations: ["bankInfo"]
    });
    
    if (!employee) throw new NotFoundException();
  
    // Cập nhật thông tin cơ bản
    if (data.phone_number) employee.phone_number = data.phone_number;
    if (data.address) employee.address = data.address;
  
    // Xử lý Bank Info (Vì có cascade: true trong Entity Employee, ta có thể gán trực tiếp)
    if (data.bank_info) {
      // Nếu chưa có bankInfo thì tạo mới, nếu có rồi thì gán đè các trường
      employee.bankInfo = {
        ...employee.bankInfo, // giữ lại id nếu có
        ...data.bank_info     // ghi đè thông tin mới
      };
    }
  
    return await this.employeeRepo.save(employee);
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
    secretKey: string;
    department_id: number;
    position_id: number;
    first_name: string; // 1. Thêm dòng này
    last_name: string; // 1. Thêm dòng này
  }) {
    // 2. Lấy dữ liệu tên ra từ data
    const {
      email,
      password,
      secretKey,
      department_id,
      position_id,
      first_name,
      last_name,
    } = data;

    // --- Các đoạn check Secret Key và Email giữ nguyên ---
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (!expectedKey || secretKey !== expectedKey) {
      throw new UnauthorizedException("Invalid system secret key");
    }

    const existing = await this.employeeRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException("Email already exists");
    }

    // --- Tìm Position và Department giữ nguyên ---
    const position = await this.positionRepo.findOne({
      where: { position_id: position_id },
    });
    if (!position) {
      throw new BadRequestException("Position not found (Invalid ID)");
    }

    const department = await this.departmentRepo.findOne({
      where: { department_id: department_id },
    });
    if (!department) {
      throw new BadRequestException("Department not found (Invalid ID)");
    }

    // --- Tạo User mới ---
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = this.employeeRepo.create({
      email,
      password: hashedPassword,
      first_name: first_name, // 3. Gán tên thật từ Frontend
      last_name: last_name, // 3. Gán họ thật từ Frontend
      position: position,
      department: department,
    });

    const saved = await this.employeeRepo.save(employee);

    return { message: "Account created successfully", id: saved.employee_id };
  }
}
