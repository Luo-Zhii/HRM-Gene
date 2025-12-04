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

  findAll() {
    return this.employeeRepo.find({ relations: ["department", "position"] });
  }

  async findOne(id: number) {
    const emp = await this.employeeRepo.findOne({
      where: { employee_id: id } as any,
      relations: ["department", "position", "bankInfo", "contracts"],
    });
    if (!emp) throw new NotFoundException("Employee not found");
    return emp;
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const emp = await this.employeeRepo.findOne({
      where: { employee_id: id } as any,
    });
    if (!emp) throw new NotFoundException("Employee not found");

    if (dto.password) {
      emp.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.first_name !== undefined) emp.first_name = dto.first_name;
    if (dto.last_name !== undefined) emp.last_name = dto.last_name;
    if (dto.avatar_url !== undefined) emp.avatar_url = dto.avatar_url;
    if (dto.phone_number !== undefined) emp.phone_number = dto.phone_number;
    if (dto.address !== undefined) emp.address = dto.address;

    if (dto.department_id !== undefined) {
      const dept = await this.deptRepo.findOne({
        where: { department_id: dto.department_id } as any,
      });
      emp.department = dept || undefined;
    }

    if (dto.position_id !== undefined) {
      const pos = await this.posRepo.findOne({
        where: { position_id: dto.position_id } as any,
      });
      emp.position = pos || undefined;
    }

    await this.employeeRepo.save(emp as any);
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
