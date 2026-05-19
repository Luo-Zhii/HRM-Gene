import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Announcement } from '../../entities/announcement.entity';
import { Employee } from '../../entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async sendAnnouncementNotifications(announcement: Announcement) {
    if (announcement.delivery_methods && announcement.delivery_methods.includes('in_app')) {
      let employees: Employee[] = [];
      if (announcement.target_audience === 'all') {
        employees = await this.employeeRepo.find();
      } else if (announcement.target_audience.startsWith('dept_')) {
        const deptId = parseInt(announcement.target_audience.split('_')[1], 10);
        employees = await this.employeeRepo.find({
          relations: ['department'],
          where: { department: { department_id: deptId } },
        });
      }

      const message = `${announcement.title} - A new announcement has been posted.`;
      const link = '/company-news';

      for (const emp of employees) {
        await this.notificationsService.createNotification(
          emp.employee_id,
          announcement.title,
          message,
          NotificationType.ANNOUNCEMENT,
          link,
        );
      }
    }
  }

  async create(dto: CreateAnnouncementDto): Promise<Announcement> {
    const announcement = this.announcementRepo.create(dto);
    const saved = await this.announcementRepo.save(announcement);

    if (saved.status === 'Active') {
      await this.sendAnnouncementNotifications(saved);
    }

    return saved;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledAnnouncements() {
    try {
      const now = new Date();
      const scheduled = await this.announcementRepo.find({
        where: {
          status: 'Scheduled',
        },
      });

      for (const ann of scheduled) {
        if (ann.scheduled_at && new Date(ann.scheduled_at) <= now) {
          ann.status = 'Active';
          await this.announcementRepo.save(ann);
          await this.sendAnnouncementNotifications(ann);
          console.log(`Scheduled announcement "${ann.title}" has been published.`);
        }
      }
    } catch (error) {
      console.error('Error handling scheduled announcements:', error);
    }
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

  async update(id: number, dto: Partial<CreateAnnouncementDto>): Promise<Announcement> {
    const existing = await this.announcementRepo.findOne({ where: { id } });
    if (!existing) throw new Error("Announcement not found");

    const wasActive = existing.status === 'Active';
    Object.assign(existing, dto);
    const saved = await this.announcementRepo.save(existing);

    if (!wasActive && saved.status === 'Active') {
      await this.sendAnnouncementNotifications(saved);
    }

    return saved;
  }
}
