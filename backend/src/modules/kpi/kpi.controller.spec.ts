import { Test, TestingModule } from '@nestjs/testing';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';

describe('KpiController', () => {
  let controller: KpiController;

  const mockService = {
    createLibrary: jest.fn(),
    getLibrary: jest.fn(),
    deleteAssignment: jest.fn(),
    createPeriod: jest.fn(),
    getPeriods: jest.fn(),
    assignKpis: jest.fn(),
    updateLibrary: jest.fn(),
    updateActual: jest.fn(),
    gradeAssignment: jest.fn(),
    getEmployeeAssignments: jest.fn(),
    calculateFinalKpiScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiController],
      providers: [
        { provide: KpiService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<KpiController>(KpiController);
    jest.clearAllMocks();
  });

  describe('createLibrary', () => {
    // [TC_BE_KPI_173]
    it('createLibrary: Tạo library KPI với employee_id từ token', async () => {
      mockService.createLibrary.mockResolvedValue({ id: 1 });
      const res = await controller.createLibrary({} as any, { user: { employee_id: 2 } });
      expect(res).toEqual({ id: 1 });
      expect(mockService.createLibrary).toHaveBeenCalledWith({}, 2);
    });
  });

  describe('getLibrary', () => {
    // [TC_BE_KPI_174]
    it('getLibrary: Trả về danh sách KPI library', async () => {
      mockService.getLibrary.mockResolvedValue([]);
      expect(await controller.getLibrary()).toEqual([]);
    });
  });

  describe('deleteAssignment', () => {
    // [TC_BE_KPI_175]
    it('deleteAssignment: Xóa KPI assignment theo ID', async () => {
      mockService.deleteAssignment.mockResolvedValue({ success: true });
      expect(await controller.deleteAssignment(1)).toEqual({ success: true });
      expect(mockService.deleteAssignment).toHaveBeenCalledWith(1);
    });
  });

  describe('createPeriod / getPeriods', () => {
    // [TC_BE_KPI_176]
    it('createPeriod: Tạo kỳ đánh giá KPI mới', async () => {
      mockService.createPeriod.mockResolvedValue({ id: 1 });
      expect(await controller.createPeriod({} as any)).toEqual({ id: 1 });
    });
    // [TC_BE_KPI_177]
    it('getPeriods: Lấy danh sách kỳ đánh giá KPI', async () => {
      mockService.getPeriods.mockResolvedValue([]);
      expect(await controller.getPeriods()).toEqual([]);
    });
  });

  describe('assignKpis', () => {
    // [TC_BE_KPI_178]
    it('assignKpis: Gán hàng loạt KPI cho nhân viên', async () => {
      mockService.assignKpis.mockResolvedValue([]);
      expect(await controller.assignKpis({} as any)).toEqual([]);
    });
  });

  describe('updateActual / gradeAssignment', () => {
    // [TC_BE_KPI_179]
    it('updateActual: Parse actual_value từ DTO và gọi service.updateActual', async () => {
      mockService.updateActual.mockResolvedValue({});
      expect(await controller.updateActual(1, { actual_value: 50 } as any)).toEqual({});
      expect(mockService.updateActual).toHaveBeenCalledWith(1, 50);
    });

    // [TC_BE_KPI_180]
    it('gradeAssignment: Manager chấm điểm KPI cho nhân viên', async () => {
      mockService.gradeAssignment.mockResolvedValue({});
      expect(await controller.gradeAssignment(1, { manager_score: 80 } as any)).toEqual({});
      expect(mockService.gradeAssignment).toHaveBeenCalledWith(1, 80);
    });
  });

  describe('getEmployeeAssignments / getMyPerformance / calculateScore', () => {
    // [TC_BE_KPI_181]
    it('getEmployeeAssignments: Lấy danh sách KPI assignment của nhân viên',
      await controller.getEmployeeAssignments(1, 2);
      expect(mockService.getEmployeeAssignments).toHaveBeenCalledWith(1, 2);
    });
    
    // [TC_BE_KPI_182]
    it('getMyPerformance: Lấy KPI của chính mình (không cần employee_id trên URL)', async () => {
      await controller.getMyPerformance({ user: { employee_id: 1 } }, 2);
      expect(mockService.getEmployeeAssignments).toHaveBeenCalledWith(1, 2);
    });
    
    // [TC_BE_KPI_183]
    it('calculateScore: Gọi service.calculateFinalKpiScore với employee_id và period_id', async () => {
      await controller.calculateScore(1, 2);
      expect(mockService.calculateFinalKpiScore).toHaveBeenCalledWith(1, 2);
    });
  });
});
