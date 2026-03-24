import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationType } from '../../entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(@Request() req: any) {
    const userId = req.user.employee_id || req.user.id;
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.employee_id || req.user.id;
    return this.notificationsService.markAsRead(Number(id), userId);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.employee_id || req.user.id;
    return this.notificationsService.deleteNotification(Number(id), userId);
  }

  // Admin endpoint for announcements
  @Post('announce')
  async createAnnouncement(@Body() body: { title: string, message: string }, @Request() req: any) {
    // Ideally check if user is Admin here by verifying req.user permissions
    const { title, message } = body;
    return this.notificationsService.sendAnnouncementToAll(title, message);
  }
}
