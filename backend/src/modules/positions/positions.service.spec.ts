import { Test, TestingModule } from '@nestjs/testing';
import { PositionsService } from './positions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Position } from '../../entities/position.entity';
import { Employee } from '../../entities/employee.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PositionsService', () => {
  let service: PositionsService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  let posRepo: any, employeeRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        { provide: getRepositoryToken(Position), useValue: mockRepo },
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
    posRepo = module.get(getRepositoryToken(Position));
    employeeRepo = module.get(getRepositoryToken(Employee));
    jest.clearAllMocks();
  });

  describe('operations', () => {
    // [TC_BE_POSITI_284]
    it('findOne: Ném NotFoundException khi chức vụ không tồn tại', async () => {
      posRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    // [TC_BE_POSITI_285]
    it('update: Cập nhật tên chức vụ thành công', async () => {
      posRepo.findOne.mockResolvedValueOnce({ position_id: 1, position_name: 'A' });
      posRepo.save.mockResolvedValue({});
      posRepo.findOne.mockResolvedValueOnce({ position_id: 1, position_name: 'B' });
      
      const res = await service.update(1, { position_name: 'B' });
      expect(res.position_name).toBe('B');
    });

    // [TC_BE_POSITI_286]
    it('remove: Ném BadRequestException khi còn nhân viên thuộc chức vụ', async () => {
      posRepo.findOne.mockResolvedValueOnce({ position_id: 1 });
      employeeRepo.count.mockResolvedValue(1);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    // [TC_BE_POSITI_287]
    it('remove: Xóa chức vụ thành công khi không có nhân viên', async () => {
      posRepo.findOne.mockResolvedValueOnce({ position_id: 1 });
      employeeRepo.count.mockResolvedValue(0);
      posRepo.remove.mockResolvedValue({});
      expect(await service.remove(1)).toEqual({ deleted: true });
    });
  });
});
