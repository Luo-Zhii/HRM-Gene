import { Test, TestingModule } from '@nestjs/testing';
import { ViolationsController } from './violations.controller';
import { ViolationsService } from './violations.service';

describe('ViolationsController', () => {
  let controller: ViolationsController;

  const mockService = {
    create: jest.fn(),
    syncAttendance: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViolationsController],
      providers: [
        { provide: ViolationsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ViolationsController>(ViolationsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    // [TC_BE_VIOLAT_323]
    it('create: Tạo biên bản vi phạm mới qua DTO', async () => {
      mockService.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({} as any)).toEqual({ id: 1 });
    });
  });

  describe('syncAttendance', () => {
    // [TC_BE_VIOLAT_324]
    it('syncAttendance: Đồng bộ dữ liệu chấm công để phát hiện vi phạm', async () => {
      mockService.syncAttendance.mockResolvedValue({ success: true });
      expect(await controller.syncAttendance()).toEqual({ success: true });
    });
  });

  describe('findAll', () => {
    // [TC_BE_VIOLAT_325]
    it('findAll: Admin với manage:system xem tất cả vi phạm (không filter)',
      const req = { user: { permissions: ['manage:system'] } };
      await controller.findAll(req);
      expect(mockService.findAll).toHaveBeenCalledWith(undefined);
    });

    // [TC_BE_VIOLAT_326]
    it('findAll: Employee thường chỉ xem vi phạm của chính mình (filter theo employee_id)',
      const req = { user: { permissions: [], employee_id: 3 } };
      await controller.findAll(req);
      expect(mockService.findAll).toHaveBeenCalledWith(3);
    });

    // [TC_BE_VIOLAT_327]
    it('findAll: Parse query param employee_id từ string sang number', async () => {
      const req = { user: {} };
      await controller.findAll(req, '5');
      expect(mockService.findAll).toHaveBeenCalledWith(5);
    });
  });

  describe('findOne', () => {
    // [TC_BE_VIOLAT_328]
    it('findOne: Employee thường bị giới hạn chỉ xem vi phạm của chính mình', async () => {
      const req = { user: { permissions: [], employee_id: 3 } };
      await controller.findOne(10, req);
      expect(mockService.findOne).toHaveBeenCalledWith(10, 3);
    });
    
    // [TC_BE_VIOLAT_329]
    it('findOne: Admin HR xem vi phạm bất kỳ (không filter employee_id)',
      const req = { user: { permissions: ['manage:employees'] } };
      await controller.findOne(10, req);
      expect(mockService.findOne).toHaveBeenCalledWith(10, undefined);
    });
  });

  describe('update / remove', () => {
    // [TC_BE_VIOLAT_330]
    it('Cập nhật thông tin biên bản vi phạm',
      mockService.update.mockResolvedValue({});
      expect(await controller.update(1, {} as any)).toEqual({});
    });

    // [TC_BE_VIOLAT_331]
    it('Xóa biên bản vi phạm',
      mockService.remove.mockResolvedValue({});
      expect(await controller.remove(1)).toEqual({});
    });
  });
});
