import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { ResignationRequest } from '../../entities/resignation-request.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(ResignationRequest)
    private readonly resignationRepo: Repository<ResignationRequest>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(authorId: number, entityType: string, entityId: string, content: string): Promise<Comment> {
    const comment = this.commentRepo.create({
      authorId,
      entityType,
      entityId,
      content,
    });

    const saved = await this.commentRepo.save(comment);

    // Notification Logic
    try {
      let targetUserId: number | null = null;
      let contextLabel = "";

      if (entityType === 'LEAVE_REQUEST') {
        const leave = await this.leaveRepo.findOne({ 
          where: { request_id: parseInt(entityId) },
          relations: ['employee']
        });
        if (leave) {
          targetUserId = authorId === leave.employee.employee_id ? 1 : leave.employee.employee_id; // Simple logic: if employee comments, notify admin (ID 1), else notify employee
          contextLabel = "Leave Request";
        }
      } else if (entityType === 'RESIGNATION') {
        const resignation = await this.resignationRepo.findOne({ 
          where: { id: parseInt(entityId) },
          relations: ['employee']
        });
        if (resignation) {
          targetUserId = authorId === resignation.employee.employee_id ? 1 : resignation.employee.employee_id;
          contextLabel = "Resignation";
        }
      }

      if (targetUserId) {
        const commentWithAuthor = await this.findOne(saved.id);
        const authorName = `${commentWithAuthor.author.first_name} ${commentWithAuthor.author.last_name}`;
        
        let link = "/dashboard/leave"; // Default
        if (entityType === 'LEAVE_REQUEST') {
          link = targetUserId === 1 ? "/admin/leave-approvals" : "/dashboard/leave";
        } else if (entityType === 'RESIGNATION') {
          link = targetUserId === 1 ? "/admin/resignations" : "/my-resignation";
        }

        await this.notificationsService.createNotification(
          targetUserId,
          "New Comment",
          `${authorName} commented on the ${contextLabel} discussion.`,
          NotificationType.COMMENT,
          link
        );
      }
    } catch (e) {
      console.error("Failed to send comment notification", e);
    }

    return this.findOne(saved.id);
  }

  async findByEntity(entityType: string, entityId: string): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { entityType, entityId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }
}
