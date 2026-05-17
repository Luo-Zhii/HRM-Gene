import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':otherUserId')
  async getMessages(@Req() req: any, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.getMessages(req.user.employee_id, parseInt(otherUserId, 10));
  }

  @Post()
  async sendMessage(@Req() req: any, @Body() body: { receiverId: number; content: string }) {
    return this.messagesService.sendMessage(req.user.employee_id, body.receiverId, body.content);
  }

  @Patch(':otherUserId/read')
  async markAsRead(@Req() req: any, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.markAsRead(req.user.employee_id, parseInt(otherUserId, 10));
  }

  @Delete(':id')
  async deleteMessage(@Req() req: any, @Param('id') id: string) {
    return this.messagesService.deleteMessage(req.user.employee_id, parseInt(id, 10));
  }
}
