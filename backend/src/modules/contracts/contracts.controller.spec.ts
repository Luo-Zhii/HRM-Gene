import { Test, TestingModule } from '@nestjs/testing';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ForbiddenException } from '@nestjs/common';

describe('ContractsController', () => {
  let controller: ContractsController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByEmployee: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [
        { provide: ContractsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ContractsController>(ContractsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a contract based strictly on inputs mapped to service', async () => {
      mockService.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({} as any)).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    it('should respect admin access to see all or specific targeted profiles without overriding', async () => {
      mockService.findAll.mockResolvedValue({ data: [] });
      const req = { user: { permissions: ['manage:system'], employee_id: 1 } };
      
      await controller.findAll(req, '2');
      expect(mockService.findAll).toHaveBeenCalledWith(2, 1, 10, undefined, undefined, undefined);
    });

    it('should restrict unprivileged users to only scan their personal data scope', async () => {
      mockService.findAll.mockResolvedValue({ data: [] });
      const req = { user: { permissions: [], employee_id: 3 } };
      
      await controller.findAll(req);
      expect(mockService.findAll).toHaveBeenCalledWith(3, 1, 10, undefined, undefined, undefined);
    });
  });

  describe('findByEmployee', () => {
    it('should throw exception for non-admin attempting to access other employees data completely', async () => {
      const req = { user: { permissions: [], employee_id: 1 } };
      await expect(controller.findByEmployee(2, req)).rejects.toThrow(ForbiddenException);
    });

    it('should correctly allow user accessing own relational data', async () => {
      const req = { user: { permissions: [], employee_id: 2 } };
      mockService.findByEmployee.mockResolvedValue([]);
      expect(await controller.findByEmployee(2, req)).toEqual([]);
    });

    it('should provide full clearance proxy for system admin or hr accessing others data array', async () => {
      const req = { user: { permissions: ['manage:system'], employee_id: 1 } };
      mockService.findByEmployee.mockResolvedValue([]);
      expect(await controller.findByEmployee(3, req)).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should strictly limit findOne context for standard users down to their individual matching id', async () => {
      const req = { user: { permissions: [], employee_id: 3 } };
      mockService.findOne.mockResolvedValue({});
      await controller.findOne(10, req);
      expect(mockService.findOne).toHaveBeenCalledWith(10, 3);
    });
  });

  describe('update / updatePut', () => {
    it('should map partial contract update identically to service execution', async () => {
      mockService.update.mockResolvedValue({ id: 1 });
      expect(await controller.update(1, {} as any)).toEqual({ id: 1 });
      expect(mockService.update).toHaveBeenCalledWith(1, {});
    });

    it('should map put execution effectively sharing update endpoint behavior', async () => {
      mockService.update.mockResolvedValue({ id: 1 });
      expect(await controller.updatePut(1, {} as any)).toEqual({ id: 1 });
    });
  });

  describe('remove', () => {
    it('should accurately bridge remove sequence straight through to repository boundary via service', async () => {
      mockService.remove.mockResolvedValue({ message: 'Deleted' });
      expect(await controller.remove(1)).toEqual({ message: 'Deleted' });
    });
  });
});
