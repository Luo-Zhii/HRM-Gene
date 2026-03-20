import { Injectable } from '@nestjs/common';
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

  async createNotification(userId: number, title: string, message: string, type: NotificationType) {
    const notification = this.notificationRepo.create({
      userId,
      title,
      message,
      type,
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

  async sendAnnouncementToAll(title: string, message: string) {
    const employees = await this.employeeRepo.find();
    
    const notifications = employees.map(emp => {
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
