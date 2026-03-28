import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { Employee } from '../../entities/employee.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(userId: number, title: string, message: string, type: NotificationType, link?: string) {
    const employee = await this.employeeRepo.findOne({ where: { employee_id: userId } });
    
    if (employee) {
      if ((type === NotificationType.LEAVE || type === NotificationType.LEAVE_REQUEST) && employee.push_notifications === false) {
        return null;
      }
      if (type === NotificationType.ANNOUNCEMENT && employee.announcements === false) {
        return null;
      }
      if (type === NotificationType.TASK && employee.task_reminders === false) {
        return null;
      }
      if (type === NotificationType.REPORT && employee.daily_reports === false) {
        return null;
      }
    }

    const notification = this.notificationRepo.create({
      userId,
      title,
      message,
      type,
      link,
    });
    
    const saved = await this.notificationRepo.save(notification);
    
    // Emit via WebSocket to specific user
    this.notificationsGateway.sendNotificationToUser(userId, saved);
    
    return saved;
  }

  async getUserNotifications(userId: number) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    await this.notificationRepo.update({ id: notificationId, userId }, { isRead: true });
    return { success: true };
  }

  async deleteNotification(notificationId: number, userId: number) {
    const result = await this.notificationRepo.delete({ id: notificationId, userId });
    
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found or unauthorized');
    }
    
    return { success: true };
  }

  async sendAnnouncementToAll(title: string, message: string) {
    const employees = await this.employeeRepo.find();
    
    // Only send to those who have opted in to announcements
    const targetEmployees = employees.filter(emp => emp.announcements !== false);

    const notifications = targetEmployees.map(emp => {
      return this.notificationRepo.create({
        userId: emp.employee_id,
        title,
        message,
        type: NotificationType.ANNOUNCEMENT
      });
    });

    const saved = await this.notificationRepo.save(notifications);

    // Emit via WebSocket
    saved.forEach(notif => {
      this.notificationsGateway.sendNotificationToUser(notif.userId, notif);
    });

    return { success: true, count: saved.length };
  }
}
