import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResignationRequest } from '../../entities/resignation-request.entity';
import { Employee } from '../../entities/employee.entity';
import { ResignationsController } from './resignations.controller';
import { ResignationsService } from './resignations.service';

@Module({
  imports: [TypeOrmModule.forFeature([ResignationRequest, Employee])],
  controllers: [ResignationsController],
  providers: [ResignationsService],
  exports: [ResignationsService]
})
export class ResignationsModule {}
