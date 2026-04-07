import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../../entities/announcement.entity';
import { Employee } from '../../entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateAnnouncementDto): Promise<Announcement> {
    const announcement = this.announcementRepo.create(dto);
    const saved = await this.announcementRepo.save(announcement);

    if (dto.delivery_methods && dto.delivery_methods.includes('in_app')) {
      let employees: Employee[] = [];
      if (dto.target_audience === 'all') {
        employees = await this.employeeRepo.find();
      } else if (dto.target_audience.startsWith('dept_')) {
        const deptId = parseInt(dto.target_audience.split('_')[1], 10);
        employees = await this.employeeRepo.find({
          relations: ['department'],
          where: { department: { department_id: deptId } },
        });
      }

      const message = `${dto.title} - A new announcement has been posted.`;
      const link = '/company-news';

      for (const emp of employees) {
        await this.notificationsService.createNotification(
          emp.employee_id,
          dto.title,
          message,
          NotificationType.ANNOUNCEMENT,
          link,
        );
      }
    }

    return saved;
  }

  async findAll(): Promise<Announcement[]> {
    return this.announcementRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  async getFeed(user: any): Promise<Announcement[]> {
    const deptId = user.department?.department_id;
    
    // Filter announcements where target_audience is 'all' OR matches the user's department
    // and status is 'Active'
    const query = this.announcementRepo.createQueryBuilder('announcement')
      .where('announcement.status = :status', { status: 'Active' })
      .andWhere('(announcement.target_audience = :all OR announcement.target_audience = :dept)', {
        all: 'all',
        dept: deptId ? `dept_${deptId}` : 'NONE_DEPT'
      })
      .orderBy('announcement.created_at', 'DESC');

    return query.getMany();
  }

  async delete(id: number): Promise<void> {
    await this.announcementRepo.delete(id);
  }
}
