import { Test, TestingModule } from '@nestjs/testing';
import { ResignationsController } from './resignations.controller';
import { ResignationsService } from './resignations.service';
import { ForbiddenException } from '@nestjs/common';

describe('ResignationsController', () => {
  let controller: ResignationsController;
  let module: TestingModule;

  const mockService = {
    create: jest.fn(),
    findMyRequests: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ResignationsController],
      providers: [
        { provide: ResignationsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ResignationsController>(ResignationsController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create / findMyRequests', () => {
    // [TC_BE_RESIGN_294]
    it('Từ chối truy cập khi user không có quyền (chưa đăng nhập hoặc role thường)', async () => {
      expect(() => controller.create({ user: {} } as any, {} as any)).toThrow(ForbiddenException);
      expect(() => controller.findMyRequests({ user: {} } as any)).toThrow(ForbiddenException);
    });

    // [TC_BE_RESIGN_295]
    it('Tạo đơn thôi việc và lấy danh sách đơn của user đã đăng nhập', async () => {
      mockService.create.mockResolvedValue({});
      mockService.findMyRequests.mockResolvedValue([]);

      expect(await controller.create({ user: { employee_id: 1 } } as any, {} as any)).toEqual({});
      expect(await controller.findMyRequests({ user: { employee_id: 1 } } as any)).toEqual([]);
    });
  });

  describe('findAll / updateStatus', () => {
    // [TC_BE_RESIGN_296]
    it('Lấy tất cả đơn thôi việc và cập nhật trạng thái (Admin/HR)', async () => {
      mockService.findAll.mockResolvedValue([]);
      mockService.updateStatus.mockResolvedValue({});

      expect(await controller.findAll({} as any)).toEqual([]);
      expect(await controller.updateStatus(1, {} as any)).toEqual({});
    });
  });
});
