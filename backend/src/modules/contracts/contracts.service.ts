import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import {
  Contract,
  ContractStatus,
} from "../../entities/contract.entity";
import { Employee } from "../../entities/employee.entity";
import { SalaryHistory } from "../../entities/salary-history.entity";
import { SalaryConfig } from "../../entities/salary-config.entity";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractRepo: Repository<Contract>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(SalaryHistory)
    private salaryHistoryRepo: Repository<SalaryHistory>,
    @InjectRepository(SalaryConfig)
    private salaryConfigRepo: Repository<SalaryConfig>,
    private dataSource: DataSource
  ) {}

  async create(createDto: CreateContractDto) {
    // Verify employee exists
    const employee = await this.employeeRepo.findOne({
      where: { employee_id: createDto.employee_id },
    });
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    // Check if contract number already exists
    const existing = await this.contractRepo.findOne({
      where: { contract_number: createDto.contract_number },
    });
    if (existing) {
      throw new BadRequestException("Contract number already exists");
    }

    // Get current salary from SalaryConfig if exists
    const currentSalary = await this.salaryConfigRepo.findOne({
      where: { employee: { employee_id: createDto.employee_id } },
      relations: ["employee"],
    });

    // Create contract
    const contract = this.contractRepo.create({
      employee,
      contract_number: createDto.contract_number,
      contract_type: createDto.contract_type,
      start_date: createDto.start_date,
      end_date: createDto.end_date,
      status: createDto.status || ContractStatus.ACTIVE,
      salary_rate: createDto.salary_rate,
      file_url: createDto.file_url,
    });

    const saved = await this.contractRepo.save(contract);

    // Record salary change in history if salary changed
    if (currentSalary) {
      const oldSalary = currentSalary.base_salary;
      const newSalary = createDto.salary_rate;
      if (oldSalary !== newSalary) {
        await this.recordSalaryChange(
          createDto.employee_id,
          oldSalary,
          newSalary,
          `Contract created: ${createDto.contract_number}`
        );
      }
    }

    return this.findOne(saved.contract_id);
  }

  async findAll(employeeId?: number) {
    const where: any = {};
    if (employeeId) {
      where.employee = { employee_id: employeeId };
    }

    return this.contractRepo.find({
      where,
      relations: ["employee"],
      order: { start_date: "DESC" },
    });
  }

  async findOne(id: number, employeeId?: number) {
    const where: any = { contract_id: id };
    if (employeeId) {
      where.employee = { employee_id: employeeId };
    }

    const contract = await this.contractRepo.findOne({
      where,
      relations: ["employee"],
    });

    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    return contract;
  }

  async update(id: number, updateDto: UpdateContractDto, employeeId?: number) {
    const contract = await this.findOne(id, employeeId);

    // If salary is being updated, record in history
    if (updateDto.salary_rate && updateDto.salary_rate !== contract.salary_rate) {
      await this.recordSalaryChange(
        contract.employee.employee_id,
        contract.salary_rate,
        updateDto.salary_rate,
        `Contract ${contract.contract_number} updated`
      );
    }

    Object.assign(contract, updateDto);
    return this.contractRepo.save(contract);
  }

  async remove(id: number, employeeId?: number) {
    const contract = await this.findOne(id, employeeId);
    await this.contractRepo.remove(contract);
    return { message: "Contract deleted successfully" };
  }

  private async recordSalaryChange(
    employeeId: number,
    oldSalary: string,
    newSalary: string,
    reason?: string
  ) {
    const history = this.salaryHistoryRepo.create({
      employee: { employee_id: employeeId } as any,
      old_salary: oldSalary,
      new_salary: newSalary,
      change_date: new Date().toISOString().slice(0, 10),
      reason: reason || "Salary updated",
    });

    await this.salaryHistoryRepo.save(history);
  }
}

