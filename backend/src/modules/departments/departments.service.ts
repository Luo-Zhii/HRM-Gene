import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Department } from "../../entities/department.entity";
import { Employee } from "../../entities/employee.entity";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>
  ) {}

  async create(dto: CreateDepartmentDto) {
    const dept = this.deptRepo.create({
      department_name: dto.department_name,
    } as any);
    return this.deptRepo.save(dept);
  }

  findAll() {
    return this.deptRepo.find();
  }

  async findOne(id: number) {
    const dept = await this.deptRepo.findOne({
      where: { department_id: id } as any,
    });
    if (!dept) throw new NotFoundException("Department not found");
    return dept;
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const dept = await this.deptRepo.findOne({
      where: { department_id: id } as any,
    });
    if (!dept) throw new NotFoundException("Department not found");

    if (dto.department_name !== undefined)
      dept.department_name = dto.department_name;

    await this.deptRepo.save(dept as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    const dept = await this.deptRepo.findOne({
      where: { department_id: id } as any,
    });
    if (!dept) throw new NotFoundException("Department not found");

    // Check if there are employees assigned to this department
    const employeeCount = await this.employeeRepo.count({
      where: { department: { department_id: id } } as any,
    });

    if (employeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete because employees are assigned to this Department`
      );
    }

    await this.deptRepo.remove(dept);
    return { deleted: true };
  }
}
