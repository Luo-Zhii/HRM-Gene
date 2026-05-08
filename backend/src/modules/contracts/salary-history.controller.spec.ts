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
    it('should respect admin access explicitly to evaluate all targeting filters', async () => {
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

    it('should strictly limit non-privileged interactions uniformly onto owned segments purely', async () => {
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
    it('should match precise query masking conditions restricting isolation explicitly for active constraints', async () => {
      mockRepo.findOne.mockResolvedValue({ history_id: 10 });
      const req = { user: { permissions: [], employee_id: 3 } };
      
      const result = await controller.findOne(10, req);
      
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { history_id: 10, employee: { employee_id: 3 } },
        relations: ['employee'],
      });
      expect(result).toEqual({ history_id: 10 });
    });

    it('should dynamically relay exceptions intercepting unfulfilled history lookups inherently', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const req = { user: { permissions: ['manage:system'], employee_id: 1 } };
      
      await expect(controller.findOne(10, req)).rejects.toThrow(NotFoundException);
    });
  });
});
