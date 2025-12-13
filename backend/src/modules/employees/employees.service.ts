import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Employee } from "../../entities/employee.entity";
import { Department } from "../../entities/department.entity";
import { Position } from "../../entities/position.entity";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(Department)
    private deptRepo: Repository<Department>,
    @InjectRepository(Position)
    private posRepo: Repository<Position>
  ) {}

  async create(dto: CreateEmployeeDto) {
    const existing = await this.employeeRepo.findOne({
      where: { email: dto.email } as any,
    });
    if (existing) throw new BadRequestException("Email already exists");

    const hashed = await bcrypt.hash(dto.password, 10);

    const emp = this.employeeRepo.create({
      email: dto.email,
      password: hashed,
      first_name: dto.first_name,
      last_name: dto.last_name,
      avatar_url: dto.avatar_url,
      phone_number: dto.phone_number,
      address: dto.address,
    } as any) as unknown as Employee;

    if (dto.department_id) {
      const dept = await this.deptRepo.findOne({
        where: { department_id: dto.department_id } as any,
      });
      if (dept) emp.department = dept;
    }

    if (dto.position_id) {
      const pos = await this.posRepo.findOne({
        where: { position_id: dto.position_id } as any,
      });
      if (pos) emp.position = pos;
    }

    return await this.employeeRepo.save(emp);
  }

  // Hàm này phục vụ cho trang Employee Directory
  // TypeORM mặc định sẽ lấy tất cả các cột (bao gồm phone_number, address)
  findAll() {
    return this.employeeRepo.find({
      relations: ["department", "position"],
      order: {
        first_name: "ASC", // Sắp xếp mặc định cho đẹp
      },
    });
  }

  async findOne(id: number) {
    const emp = await this.employeeRepo.findOne({
      where: { employee_id: id } as any,
      relations: ["department", "position", "bankInfo", "contracts"],
    });
    if (!emp) throw new NotFoundException("Employee not found");
    return emp;
  }

  // CẬP NHẬT QUAN TRỌNG Ở ĐÂY
  async update(id: number, dto: UpdateEmployeeDto & { bank_info?: any }) {
    // 1. Load employee kèm theo bankInfo để có thể update đè lên hoặc tạo mới
    const emp = await this.employeeRepo.findOne({
      where: { employee_id: id } as any,
      relations: ["bankInfo"], 
    });
    
    if (!emp) throw new NotFoundException("Employee not found");

    // Logic update Password
    if (dto.password) {
      emp.password = await bcrypt.hash(dto.password, 10);
    }

    // Logic update thông tin cơ bản
    if (dto.first_name !== undefined) emp.first_name = dto.first_name;
    if (dto.last_name !== undefined) emp.last_name = dto.last_name;
    if (dto.avatar_url !== undefined) emp.avatar_url = dto.avatar_url;
    if (dto.phone_number !== undefined) emp.phone_number = dto.phone_number;
    if (dto.address !== undefined) emp.address = dto.address;

    // Logic update Department
    if (dto.department_id !== undefined) {
      const dept = await this.deptRepo.findOne({
        where: { department_id: dto.department_id } as any,
      });
      emp.department = dept || undefined;
    }

    // Logic update Position
    if (dto.position_id !== undefined) {
      const pos = await this.posRepo.findOne({
        where: { position_id: dto.position_id } as any,
      });
      emp.position = pos || undefined;
    }

    // Logic update Bank Info (MỚI)
    // Vì Employee entity có cascade: true với BankInfo, ta có thể gán trực tiếp
    if (dto.bank_info) {
      if (emp.bankInfo) {
        // Nếu đã có bank info -> Merge dữ liệu mới vào dữ liệu cũ (giữ lại ID)
        emp.bankInfo = {
          ...emp.bankInfo,
          ...dto.bank_info,
        };
      } else {
        // Nếu chưa có -> Gán object mới
        emp.bankInfo = dto.bank_info;
      }
    }

    await this.employeeRepo.save(emp as any);
    
    // Trả về data mới nhất
    return this.findOne(id);
  }

  async remove(id: number) {
    const emp = await this.employeeRepo.findOne({
      where: { employee_id: id } as any,
    });
    if (!emp) throw new NotFoundException("Employee not found");
    await this.employeeRepo.remove(emp);
    return { deleted: true };
  }
}