import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
  ) {}

  async sendMessage(senderId: number, receiverId: number, content: string) {
    const msg = this.messageRepo.create({
      sender: { employee_id: senderId } as any,
      receiver: { employee_id: receiverId } as any,
      content,
    });
    const saved = await this.messageRepo.save(msg);
    
    const populated = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });

    // Create a notification for the receiver
    try {
      await this.notificationsService.createNotification(
        receiverId,
        `New Message from ${populated?.sender?.first_name} ${populated?.sender?.last_name}`,
        content.length > 60 ? `${content.substring(0, 57)}...` : content,
        'comment' as any, // Using COMMENT notification type since it uses MessageSquare icon in frontend
        `/directory?chatWith=${senderId}`
      );
    } catch (err) {
      console.error('Failed to create message notification:', err);
    }

    // We can piggyback on the same gateway! We'll just emit a "newMessage" event
    const sockets = (this.notificationsGateway as any).userSockets?.get(receiverId);
    if (sockets && sockets.size > 0) {
      sockets.forEach((socketId: string) => {
        this.notificationsGateway.server.to(socketId).emit('newMessage', populated);
      });
    }

    return populated;
  }

  async getMessages(user1: number, user2: number) {
    return this.messageRepo.find({
      where: [
        { sender: { employee_id: user1 }, receiver: { employee_id: user2 } },
        { sender: { employee_id: user2 }, receiver: { employee_id: user1 } },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'ASC' },
    });
  }

  async markAsRead(receiverId: number, senderId: number) {
    await this.messageRepo.update(
      { receiver: { employee_id: receiverId }, sender: { employee_id: senderId }, is_read: false },
      { is_read: true }
    );
    return { success: true };
  }

  async deleteMessage(employeeId: number, messageId: number) {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only the sender can delete their message
    if (message.sender.employee_id !== employeeId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    message.is_deleted = true;
    message.content = 'This message was deleted';
    const updated = await this.messageRepo.save(message);

    // Emit over WebSocket/Gateway to let the receiver know immediately
    const receiverId = message.receiver.employee_id;
    const sockets = (this.notificationsGateway as any).userSockets?.get(receiverId);
    if (sockets && sockets.size > 0) {
      sockets.forEach((socketId: string) => {
        this.notificationsGateway.server.to(socketId).emit('messageDeleted', { messageId, updated });
      });
    }

    // Emit to sender's other sockets too
    const senderSockets = (this.notificationsGateway as any).userSockets?.get(employeeId);
    if (senderSockets && senderSockets.size > 0) {
      senderSockets.forEach((socketId: string) => {
        this.notificationsGateway.server.to(socketId).emit('messageDeleted', { messageId, updated });
      });
    }

    return updated;
  }
}
