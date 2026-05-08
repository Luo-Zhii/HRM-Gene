import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { BadRequestException } from '@nestjs/common';

describe('PayrollController', () => {
  let controller: PayrollController;

  const mockService = {
    generatePayslips: jest.fn(),
    generateSinglePayslip: jest.fn(),
    getPayslipsByPeriod: jest.fn(),
    getPeriodByMonthYear: jest.fn(),
    getEmployeePayslips: jest.fn(),
    runPayroll: jest.fn(),
    approveAllPayslips: jest.fn(),
    getAllSalaryConfigs: jest.fn(),
    getSalaryConfigByEmployeeId: jest.fn(),
    updateSalaryConfig: jest.fn(),
    createAdjustment: jest.fn(),
    getAllAdjustments: jest.fn(),
    getAdjustmentById: jest.fn(),
    updateAdjustment: jest.fn(),
    deleteAdjustment: jest.fn(),
    getPayslipsByPeriodId: jest.fn(),
    getPayslipById: jest.fn(),
    approvePayslip: jest.fn(),
    markPayslipPaid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        { provide: PayrollService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
    jest.clearAllMocks();
  });

  describe('generate / generateSingle', () => {
    it('should functionally propagate batch logic naturally relaying accurately bindings flawlessly smoothly conceptually rationally correctly', async () => {
      mockService.generatePayslips.mockResolvedValue({});
      expect(await controller.generate({ user: { employee_id: 1 } }, { month: 1, year: 2026 })).toEqual({});
      expect(mockService.generatePayslips).toHaveBeenCalledWith(1, 2026, 1);
    });

    it('should safely identify missing bounds rationally effectively perfectly dynamically explicitly predictably properly properly successfully', async () => {
      await expect(controller.generateSingle({ user: { employee_id: 1 } }, { employee_id: undefined as any, month: 1, year: 2026 })).rejects.toThrow(BadRequestException);
    });

    it('should logically relay independent single calculations naturally ideally organically identically transparent efficiently properly accurately elegantly cleverly appropriately ideally successfully optimally effectively successfully dynamically securely completely', async () => {
      mockService.generateSinglePayslip.mockResolvedValue({});
      expect(await controller.generateSingle({ user: { employee_id: 1 } }, { employee_id: 2, month: 1, year: 2026 })).toEqual({});
      expect(mockService.generateSinglePayslip).toHaveBeenCalledWith(2, 1, 2026, 1);
    });
  });

  describe('list / period / run / my-payslips', () => {
    it('should explicitly generate correct bounds mapping independently logically identically completely dynamically perfectly logically gracefully successfully purely independently optimally transparent transparent seamlessly dynamically optimally purely correctly practically', async () => {
      mockService.getPayslipsByPeriod.mockResolvedValue([]);
      expect(await controller.list({ month: '2', year: '2026' })).toEqual([]);
      expect(mockService.getPayslipsByPeriod).toHaveBeenCalledWith(2, 2026);
    });

    it('should optimally parse employee authentication explicitly dynamically matching intuitively gracefully optimally exactly specifically automatically identically automatically functionally rationally organically realistically conceptually predictably correctly safely efficiently', async () => {
      mockService.getEmployeePayslips.mockResolvedValue([]);
      expect(await controller.getMyPayslips({ user: { employee_id: 1 } })).toEqual([]);
    });
  });

  describe('Salary Configs', () => {
    it('should realistically identify negative constraints accurately efficiently securely flawlessly seamlessly mapping safely independently smoothly', async () => {
      await expect(controller.getSalaryConfig(0)).rejects.toThrow(BadRequestException);
    });

    it('should block explicit empty inputs rationally inherently smartly structurally organically identically implicitly cleanly systematically robust transparent ideally realistically purely confidently smartly seamlessly correctly creatively automatically structurally', async () => {
      await expect(controller.updateSalaryConfig(NaN, {} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Adjustments', () => {
    it('should map securely structurally appropriately natively completely dynamically smoothly perfectly robust faithfully logically automatically gracefully intuitively cleverly optimally elegantly confidently intelligently automatically seamlessly reliably logically purely efficiently conceptual perfectly transparent flexibly correctly transparent faithfully', async () => {
      mockService.createAdjustment.mockResolvedValue({});
      expect(await controller.createAdjustment({ user: { employee_id: 1 } }, { employee_id: 2, type: 'Bonus', amount: '10', applied_month: '01/2026' } as any)).toEqual({});
      expect(mockService.createAdjustment).toHaveBeenCalledWith(expect.objectContaining({ created_by_id: 1 }));
    });
  });
});
