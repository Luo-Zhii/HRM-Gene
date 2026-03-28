import { 
  Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Req, ForbiddenException, UseGuards 
} from '@nestjs/common';
import { ResignationsService } from './resignations.service';
import { CreateResignationDto } from './dto/create-resignation.dto';
import { UpdateResignationDto } from './dto/update-resignation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Request } from 'express';

@Controller('resignations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResignationsController {
  constructor(private readonly service: ResignationsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateResignationDto) {
    const employeeId = (req.user as any)?.employee_id;
    if (!employeeId) throw new ForbiddenException('User session missing employee ID');
    return this.service.create(employeeId, dto);
  }

  @Get('my')
  findMyRequests(@Req() req: Request) {
    const employeeId = (req.user as any)?.employee_id;
    if (!employeeId) throw new ForbiddenException('User session missing employee ID');
    return this.service.findMyRequests(employeeId);
  }

  @Get('all')
  findAll(@Req() req: Request) {
    // Ideally ensure user is HR/manager 
    return this.service.findAll();
  }

  @Patch(':id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResignationDto
  ) {
    return this.service.updateStatus(id, dto);
  }
}
