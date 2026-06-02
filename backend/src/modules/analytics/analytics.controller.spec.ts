import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  const mockService = {
    getDashboardData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    jest.clearAllMocks();
  });

  describe('getDashboardData', () => {
    // [TC_BE_ANALYT_034]
    it('should return dashboard data', async () => {
      mockService.getDashboardData.mockResolvedValue({ summary: {} });
      expect(await controller.getDashboardData()).toEqual({ summary: {} });
      expect(mockService.getDashboardData).toHaveBeenCalled();
    });
  });
});
