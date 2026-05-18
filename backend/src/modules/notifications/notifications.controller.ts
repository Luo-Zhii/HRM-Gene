import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, Delete, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @Post('announce')
  async createAnnouncement(@Body() body: { title: string, message: string }, @Request() req: any) {
    const position = req.user.position?.position_name?.toLowerCase();
    const allowedRoles = ['admin', 'hr', 'hr manager', 'director'];
    if (!position || !allowedRoles.includes(position)) {
      throw new ForbiddenException('Only admins and HR can send announcements');
    }
    const { title, message } = body;
    return this.notificationsService.sendAnnouncementToAll(title, message);
  }
}
