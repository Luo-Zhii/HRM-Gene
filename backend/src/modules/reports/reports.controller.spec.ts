import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockService = {
    payrollSummary: jest.fn(),
    getDashboardData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    jest.clearAllMocks();
  });

  describe('payrollSummary', () => {
    // [TC_BE_REPORT_288]
    it('payrollSummary controller: Gọi service với tham số đã parse (string → number)',
      mockService.payrollSummary.mockResolvedValue({});
      expect(await controller.payrollSummary('2', '2026')).toEqual({});
      expect(mockService.payrollSummary).toHaveBeenCalledWith(2, 2026);
    });

    // [TC_BE_REPORT_289]
    it('payrollSummary: Xử lý fallback khi month và year là chuỗi rỗng', async () => {
      mockService.payrollSummary.mockResolvedValue({});
      await controller.payrollSummary('', '');
      // month, year parsing fallbacks will execute
      expect(mockService.payrollSummary).toHaveBeenCalled();
    });
  });

  describe('getDashboard', () => {
    // [TC_BE_REPORT_290]
    it('getDashboard: Proxy request đến service.getDashboardData', async () => {
      mockService.getDashboardData.mockResolvedValue({});
      expect(await controller.getDashboard()).toEqual({});
    });
  });
});
