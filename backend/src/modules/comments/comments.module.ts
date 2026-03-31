import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../../entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { ResignationRequest } from '../../entities/resignation-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, LeaveRequest, ResignationRequest]),
    NotificationsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
