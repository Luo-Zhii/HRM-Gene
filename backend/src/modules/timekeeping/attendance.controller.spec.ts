import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceAdminController } from './attendance.controller';
import { TimeKeepingService } from './timekeeping.service';

describe('AttendanceAdminController', () => {
  let controller: AttendanceAdminController;

  const mockService = {
    getAllForAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceAdminController],
      providers: [
        { provide: TimeKeepingService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<AttendanceAdminController>(AttendanceAdminController);
    jest.clearAllMocks();
  });

  describe('getAllForAdmin', () => {
    // [TC_BE_TIMEKE_306]
    it('Parse page/limit từ string sang number và gọi service', async () => {
      mockService.getAllForAdmin.mockResolvedValue({});
      await controller.getAllForAdmin('1', '10', 's', 'e', undefined);
      expect(mockService.getAllForAdmin).toHaveBeenCalledWith(1, 10, 's', 'e', undefined);
    });

    // [TC_BE_TIMEKE_307]
    it('Sử dụng giá trị mặc định (page=1, limit=50) khi tham số rỗng', async () => {
      mockService.getAllForAdmin.mockResolvedValue({});
      await controller.getAllForAdmin('', '', undefined, undefined, undefined);
      expect(mockService.getAllForAdmin).toHaveBeenCalledWith(1, 50, undefined, undefined, undefined);
    });
  });
});
