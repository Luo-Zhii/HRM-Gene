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
    it('should dispatch creation passing implicitly extracted identity from guard token inherently', async () => {
      mockService.createLibrary.mockResolvedValue({ id: 1 });
      const res = await controller.createLibrary({} as any, { user: { employee_id: 2 } });
      expect(res).toEqual({ id: 1 });
      expect(mockService.createLibrary).toHaveBeenCalledWith({}, 2);
    });
  });

  describe('getLibrary', () => {
    it('should structurally relay response unmutated array mapping', async () => {
      mockService.getLibrary.mockResolvedValue([]);
      expect(await controller.getLibrary()).toEqual([]);
    });
  });

  describe('deleteAssignment', () => {
    it('should properly proxy deletion sequence matching ID strictly', async () => {
      mockService.deleteAssignment.mockResolvedValue({ success: true });
      expect(await controller.deleteAssignment(1)).toEqual({ success: true });
      expect(mockService.deleteAssignment).toHaveBeenCalledWith(1);
    });
  });

  describe('createPeriod / getPeriods', () => {
    it('should trigger period mapping strictly without interference', async () => {
      mockService.createPeriod.mockResolvedValue({ id: 1 });
      expect(await controller.createPeriod({} as any)).toEqual({ id: 1 });
    });
    it('should sequentially retrieve bound collections directly globally', async () => {
      mockService.getPeriods.mockResolvedValue([]);
      expect(await controller.getPeriods()).toEqual([]);
    });
  });

  describe('assignKpis', () => {
    it('should proxy batch creation assignment operations structurally onto service map', async () => {
      mockService.assignKpis.mockResolvedValue([]);
      expect(await controller.assignKpis({} as any)).toEqual([]);
    });
  });

  describe('updateActual / gradeAssignment', () => {
    it('should exclusively isolate precise numeric field extraction mapping transparently avoiding payload collision', async () => {
      mockService.updateActual.mockResolvedValue({});
      expect(await controller.updateActual(1, { actual_value: 50 } as any)).toEqual({});
      expect(mockService.updateActual).toHaveBeenCalledWith(1, 50);
    });

    it('should independently proxy mapping isolation targeting strictly manager bounds effectively', async () => {
      mockService.gradeAssignment.mockResolvedValue({});
      expect(await controller.gradeAssignment(1, { manager_score: 80 } as any)).toEqual({});
      expect(mockService.gradeAssignment).toHaveBeenCalledWith(1, 80);
    });
  });

  describe('getEmployeeAssignments / getMyPerformance / calculateScore', () => {
    it('should structurally retrieve relational components independently binding parameters identically purely', async () => {
      await controller.getEmployeeAssignments(1, 2);
      expect(mockService.getEmployeeAssignments).toHaveBeenCalledWith(1, 2);
    });
    
    it('should intercept contextual parameters effectively overriding endpoint semantics seamlessly', async () => {
      await controller.getMyPerformance({ user: { employee_id: 1 } }, 2);
      expect(mockService.getEmployeeAssignments).toHaveBeenCalledWith(1, 2);
    });
    
    it('should successfully orchestrate cumulative compilation request isolating score natively purely', async () => {
      await controller.calculateScore(1, 2);
      expect(mockService.calculateFinalKpiScore).toHaveBeenCalledWith(1, 2);
    });
  });
});
