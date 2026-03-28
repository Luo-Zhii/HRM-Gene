import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ResignationRequest, ResignationStatus } from '../../entities/resignation-request.entity';
import { Employee, EmploymentStatus } from '../../entities/employee.entity';
import { CreateResignationDto } from './dto/create-resignation.dto';
import { UpdateResignationDto } from './dto/update-resignation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';

@Injectable()
export class ResignationsService {
  constructor(
    @InjectRepository(ResignationRequest)
    private resignationRepo: Repository<ResignationRequest>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private dataSource: DataSource,
    private notificationsService: NotificationsService
  ) {}

  async create(employeeId: number, dto: CreateResignationDto) {
    const existing = await this.resignationRepo.findOne({
      where: { employee_id: employeeId, status: ResignationStatus.PENDING } as any
    });
    
    if (existing) {
      throw new BadRequestException('You already have a pending resignation request.');
    }

    const employee = await this.employeeRepo.findOne({ 
      where: { employee_id: employeeId },
      relations: ['position']
    });

    const request = this.resignationRepo.create({
      employee_id: employeeId,
      requested_last_day: dto.requested_last_day,
      reason_text: dto.reason_text,
      status: ResignationStatus.PENDING
    } as any);

    const saved = await this.resignationRepo.save(request);

    // TRIGGER NOTIFICATION: Send to HR/Super Admins or users with manage:employee permission
    const admins = await this.employeeRepo.find({
      relations: ['position', 'position.permissions', 'position.permissions.permission'],
      where: [
        { position: { position_name: 'Super Admin' } },
        { position: { position_name: 'HR Admin' } },
        { position: { position_name: 'Admin' } },
        { position: { permissions: { permission: { permission_name: 'manage:employee' } } } }
      ]
    } as any);

    const employeeName = employee ? `${employee.first_name} ${employee.last_name}`.trim() : `Employee #${employeeId}`;
    
    // Use a Set to avoid duplicate notifications if an admin matches multiple criteria
    const adminIds = new Set(admins.map(a => a.employee_id));
    
    for (const adminId of adminIds) {
      await this.notificationsService.createNotification(
        adminId,
        'New Resignation Request',
        `New resignation request submitted by ${employeeName}`,
        NotificationType.RESIGNATION_REQUEST,
        '/admin/resignations'
      );
    }

    return saved;
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
    const updated = await this.resignationRepo.save(request as any);

    // TRIGGER NOTIFICATION: Notify the employee of the decision
    try {
      const statusLabel = dto.status === ResignationStatus.APPROVED ? 'Approved' : 'Rejected';
      await this.notificationsService.createNotification(
        request.employee_id,
        `Resignation Request ${statusLabel}`,
        `Your resignation request has been ${statusLabel}.`,
        NotificationType.RESIGNATION_STATUS_UPDATE,
        '/my-resignation'
      );
    } catch (error) {
      console.error('Failed to send resignation status update notification:', error);
      // Don't throw, we don't want to crash the main workflow
    }

    return updated;
  }
}
