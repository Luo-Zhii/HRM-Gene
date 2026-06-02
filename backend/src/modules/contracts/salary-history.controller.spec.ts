import { Test, TestingModule } from '@nestjs/testing';
import { SalaryHistoryController } from './salary-history.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SalaryHistory } from '../../entities/salary-history.entity';
import { NotFoundException } from '@nestjs/common';

describe('SalaryHistoryController', () => {
  let controller: SalaryHistoryController;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalaryHistoryController],
      providers: [
        { provide: getRepositoryToken(SalaryHistory), useValue: mockRepo },
      ],
    }).compile();

    controller = module.get<SalaryHistoryController>(SalaryHistoryController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    // [TC_BE_CONTRA_122]
    it('findAll: Admin với manage:system xem lịch sử lương theo employee_id query', async () => {
      mockRepo.find.mockResolvedValue([]);
      const req = { user: { permissions: ['manage:system'], employee_id: 1 } };
      
      const result = await controller.findAll(req, '2');
      
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { employee: { employee_id: 2 } },
        relations: ['employee'],
        order: { change_date: 'DESC' },
      });
      expect(result).toEqual([]);
    });

    // [TC_BE_CONTRA_123]
    it('findAll: Employee thường chỉ xem lịch sử lương của chính mình', async () => {
      mockRepo.find.mockResolvedValue([]);
      const req = { user: { permissions: [], employee_id: 3 } };
      
      await controller.findAll(req);
      
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { employee: { employee_id: 3 } },
        relations: ['employee'],
        order: { change_date: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    // [TC_BE_CONTRA_124]
    it('findOne: Employee thường bị giới hạn chỉ xem lịch sử lương của chính mình', async () => {
      mockRepo.findOne.mockResolvedValue({ history_id: 10 });
      const req = { user: { permissions: [], employee_id: 3 } };
      
      const result = await controller.findOne(10, req);
      
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { history_id: 10, employee: { employee_id: 3 } },
        relations: ['employee'],
      });
      expect(result).toEqual({ history_id: 10 });
    });

    // [TC_BE_CONTRA_125]
    it('findOne: Ném NotFoundException khi không tìm thấy lịch sử lương', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const req = { user: { permissions: ['manage:system'], employee_id: 1 } };
      
      await expect(controller.findOne(10, req)).rejects.toThrow(NotFoundException);
    });
  });
});
