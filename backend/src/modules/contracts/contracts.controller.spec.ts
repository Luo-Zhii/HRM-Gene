import { Test, TestingModule } from '@nestjs/testing';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ForbiddenException } from '@nestjs/common';

describe('ContractsController', () => {
  let controller: ContractsController;
  let module: TestingModule;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByEmployee: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [
        { provide: ContractsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ContractsController>(ContractsController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    // [TC_BE_CONTRA_103]
    it('Tạo hợp đồng mới: Proxy DTO sang service.create', async () => {
      mockService.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({} as any)).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    // [TC_BE_CONTRA_104]
    it('findAll: Admin với manage:system xem tất cả hợp đồng', async () => {
      mockService.findAll.mockResolvedValue({ data: [] });
      const req = { user: { permissions: ['manage:system'], employee_id: 1 } };

      await controller.findAll(req, '2');
      expect(mockService.findAll).toHaveBeenCalledWith(2, 1, 10, undefined, undefined, undefined);
    });

    // [TC_BE_CONTRA_105]
    it('findAll: Employee thường chỉ xem hợp đồng của chính mình', async () => {
      mockService.findAll.mockResolvedValue({ data: [] });
      const req = { user: { permissions: [], employee_id: 3 } };

      await controller.findAll(req);
      expect(mockService.findAll).toHaveBeenCalledWith(3, 1, 10, undefined, undefined, undefined);
    });
  });

  describe('findByEmployee', () => {
    // [TC_BE_CONTRA_106]
    it('findByEmployee: Từ chối non-admin xem hợp đồng của nhân viên khác', async () => {
      const req = { user: { permissions: [], employee_id: 1 } };
      await expect(controller.findByEmployee(2, req)).rejects.toThrow(ForbiddenException);
    });

    // [TC_BE_CONTRA_107]
    it('findByEmployee: User xem được hợp đồng của chính mình', async () => {
      const req = { user: { permissions: [], employee_id: 2 } };
      mockService.findByEmployee.mockResolvedValue([]);
      expect(await controller.findByEmployee(2, req)).toEqual([]);
    });

    // [TC_BE_CONTRA_108]
    it('findByEmployee: Admin với manage:system xem hợp đồng của nhân viên bất kỳ', async () => {
      const req = { user: { permissions: ['manage:system'], employee_id: 1 } };
      mockService.findByEmployee.mockResolvedValue([]);
      expect(await controller.findByEmployee(3, req)).toEqual([]);
    });
  });

  describe('findOne', () => {
    // [TC_BE_CONTRA_109]
    it('findOne: Employee thường bị giới hạn chỉ xem hợp đồng của chính mình', async () => {
      const req = { user: { permissions: [], employee_id: 3 } };
      mockService.findOne.mockResolvedValue({});
      await controller.findOne(10, req);
      expect(mockService.findOne).toHaveBeenCalledWith(10, 3);
    });
  });

  describe('update / updatePut', () => {
    // [TC_BE_CONTRA_110]
    it('update: Proxy cập nhật hợp đồng sang service.update', async () => {
      mockService.update.mockResolvedValue({ id: 1 });
      expect(await controller.update(1, {} as any)).toEqual({ id: 1 });
      expect(mockService.update).toHaveBeenCalledWith(1, {});
    });

    // [TC_BE_CONTRA_111]
    it('updatePut: PUT request hoạt động giống update', async () => {
      mockService.update.mockResolvedValue({ id: 1 });
      expect(await controller.updatePut(1, {} as any)).toEqual({ id: 1 });
    });
  });

  describe('remove', () => {
    // [TC_BE_CONTRA_112]
    it('remove: Proxy yêu cầu xóa hợp đồng sang service.remove', async () => {
      mockService.remove.mockResolvedValue({ message: 'Deleted' });
      expect(await controller.remove(1)).toEqual({ message: 'Deleted' });
    });
  });
});
