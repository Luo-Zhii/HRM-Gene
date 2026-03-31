import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: { entityType: string; entityId: string; content: string }) {
    const authorId = req.user.employee_id;
    return this.commentsService.create(authorId, body.entityType, body.entityId, body.content);
  }

  @Get(':entityType/:entityId')
  async findByEntity(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.commentsService.findByEntity(entityType, entityId);
  }
}
