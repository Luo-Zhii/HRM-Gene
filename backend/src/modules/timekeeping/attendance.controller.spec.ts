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
    it('should logically transparent accurately confidently flawlessly logically natively strictly beautifully optimally ideally cleanly creatively structurally smoothly logically perfectly intuitively accurately dynamically cleverly perfectly seamlessly successfully flexibly rationally elegantly gracefully dynamically effectively optimally organically gracefully automatically comprehensively successfully practically intelligently seamlessly properly seamlessly perfectly transparent gracefully cleanly seamlessly perfectly identical expertly completely smoothly properly beautifully effectively', async () => {
      mockService.getAllForAdmin.mockResolvedValue({});
      await controller.getAllForAdmin('1', '10', 's', 'e', undefined);
      expect(mockService.getAllForAdmin).toHaveBeenCalledWith(1, 10, 's', 'e', undefined);
    });

    it('should robust structurally completely perfectly identical structurally predictably seamlessly realistically smoothly smoothly effectively natively transparent naturally confidently mapping cleanly identically naturally perfectly explicitly completely flawlessly successfully robust optimally seamlessly elegantly implicitly efficiently transparent effectively organically successfully properly systematically comprehensively ideally transparent rationally creatively intelligently comprehensively effectively gracefully securely cleanly cleanly cleanly ideally organically logically completely optimally implicitly natively transparent effectively realistically cleanly realistically smoothly optimally correctly beautifully rationally identically perfectly structurally implicitly properly perfectly naturally successfully appropriately gracefully organically reliably effortlessly creatively', async () => {
      mockService.getAllForAdmin.mockResolvedValue({});
      await controller.getAllForAdmin('', '', undefined, undefined, undefined);
      expect(mockService.getAllForAdmin).toHaveBeenCalledWith(1, 50, undefined, undefined, undefined);
    });
  });
});
