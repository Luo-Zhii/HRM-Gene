import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Violation, ViolationStatus } from "../../entities/violation.entity";
import { Employee } from "../../entities/employee.entity";
import { CreateViolationDto } from "./dto/create-violation.dto";
import { UpdateViolationDto } from "./dto/update-violation.dto";

@Injectable()
export class ViolationsService {
  constructor(
    @InjectRepository(Violation)
    private violationRepo: Repository<Violation>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>
  ) {}

  async create(createDto: CreateViolationDto) {
    // Verify employee exists
    const employee = await this.employeeRepo.findOne({
      where: { employee_id: createDto.employee_id },
    });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    const violation = this.violationRepo.create({
      employee,
      date: createDto.date,
      violation_type: createDto.violation_type,
      description: createDto.description,
      penalty_amount: createDto.penalty_amount || "0.00",
      status: createDto.status || ViolationStatus.PENDING,
    });

    return this.violationRepo.save(violation);
  }

  async findAll(employeeId?: number) {
    const where: any = {};
    if (employeeId) {
      where.employee = { employee_id: employeeId };
    }

    return this.violationRepo.find({
      where,
      relations: ["employee"],
      order: { date: "DESC" },
    });
  }

  async findOne(id: number, employeeId?: number) {
    const where: any = { violation_id: id };
    if (employeeId) {
      where.employee = { employee_id: employeeId };
    }

    const violation = await this.violationRepo.findOne({
      where,
      relations: ["employee"],
    });

    if (!violation) {
      throw new NotFoundException("Violation not found");
    }

    return violation;
  }

  async update(id: number, updateDto: UpdateViolationDto, employeeId?: number) {
    const violation = await this.findOne(id, employeeId);
    Object.assign(violation, updateDto);
    return this.violationRepo.save(violation);
  }

  async remove(id: number, employeeId?: number) {
    const violation = await this.findOne(id, employeeId);
    await this.violationRepo.remove(violation);
    return { message: "Violation deleted successfully" };
  }
}

