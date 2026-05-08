import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockDashboardService = {
    getEmployeeData: jest.fn(),
    getAdminData: jest.fn(),
    getHolidayList: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    jest.clearAllMocks();
  });

  describe('getEmployeeData', () => {
    it('should call getEmployeeData on the service and return result', async () => {
      mockDashboardService.getEmployeeData.mockResolvedValue({ stats: {} });
      const req = { user: { employee_id: 1 } };
      
      const result = await controller.getEmployeeData(req);
      
      expect(result).toEqual({ stats: {} });
      expect(mockDashboardService.getEmployeeData).toHaveBeenCalledWith({ employee_id: 1 });
    });
  });

  describe('getAdminData', () => {
    it('should call getAdminData on the service and return result', async () => {
      mockDashboardService.getAdminData.mockResolvedValue({ attendance: {} });
      
      const result = await controller.getAdminData();
      
      expect(result).toEqual({ attendance: {} });
      expect(mockDashboardService.getAdminData).toHaveBeenCalled();
    });
  });

  describe('getHolidays', () => {
    it('should call getHolidayList on the service', async () => {
      mockDashboardService.getHolidayList.mockReturnValue([]);
      
      const result = await controller.getHolidays();
      
      expect(result).toEqual([]);
      expect(mockDashboardService.getHolidayList).toHaveBeenCalled();
    });
  });
});
