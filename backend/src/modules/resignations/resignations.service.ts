import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ResignationRequest, ResignationStatus } from '../../entities/resignation-request.entity';
import { Employee, EmploymentStatus } from '../../entities/employee.entity';
import { CreateResignationDto } from './dto/create-resignation.dto';
import { UpdateResignationDto } from './dto/update-resignation.dto';

@Injectable()
export class ResignationsService {
  constructor(
    @InjectRepository(ResignationRequest)
    private resignationRepo: Repository<ResignationRequest>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private dataSource: DataSource
  ) {}

  async create(employeeId: number, dto: CreateResignationDto) {
    const existing = await this.resignationRepo.findOne({
      where: { employee_id: employeeId, status: ResignationStatus.PENDING } as any
    });
    
    if (existing) {
      throw new BadRequestException('You already have a pending resignation request.');
    }

    const request = this.resignationRepo.create({
      employee_id: employeeId,
      requested_last_day: dto.requested_last_day,
      reason_text: dto.reason_text,
      status: ResignationStatus.PENDING
    } as any);

    return this.resignationRepo.save(request);
  }

  async findMyRequests(employeeId: number) {
    return this.resignationRepo.find({
      where: { employee_id: employeeId } as any,
      order: { created_at: 'DESC' } as any
    });
  }

  async findAll() {
    return this.resignationRepo.find({
      relations: ['employee'],
      order: { created_at: 'DESC' } as any
    });
  }

  async updateStatus(id: number, dto: UpdateResignationDto) {
    const request = await this.resignationRepo.findOne({
      where: { id } as any,
      relations: ['employee']
    });

    if (!request) {
      throw new NotFoundException('Resignation request not found');
    }

    if (request.status !== ResignationStatus.PENDING) {
      throw new BadRequestException('Can only update pending requests');
    }

    if (dto.status === ResignationStatus.APPROVED) {
      if (!dto.resignation_category) {
        throw new BadRequestException('Approval requires a valid resignation_category for analytics');
      }

      // Update Employee Status
      request.employee.employment_status = EmploymentStatus.TERMINATED;
      request.employee.resignation_reason = dto.resignation_category;
      request.employee.resignation_date = request.requested_last_day;

      await this.employeeRepo.save(request.employee as any);

      // Explicitly Terminate Active Contract to sync with global Analytics
      await this.dataSource.query(
        `UPDATE contract SET status = 'Terminated', end_date = $1 WHERE employee_id = $2 AND status = 'Active'`,
        [request.requested_last_day, request.employee.employee_id]
      );
    }

    request.status = dto.status;
    return this.resignationRepo.save(request as any);
  }
}
