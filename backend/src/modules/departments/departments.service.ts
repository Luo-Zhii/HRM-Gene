import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Department } from "../../entities/department.entity";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>
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
    await this.deptRepo.remove(dept);
    return { deleted: true };
  }
}
