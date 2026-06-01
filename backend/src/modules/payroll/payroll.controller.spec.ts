import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AdjustmentType } from '../../entities/salary-adjustment.entity';

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

  // ==================== GENERATE PAYSLIPS ====================
  describe('generate', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_01
     * @Priority: P1
     * @Category: Positive
     * @Description: Generate payslips should delegate to service with correct month, year and user id
     * @Steps:
     * 1. Arrange: generatePayslips returns summary
     * 2. Act: Call controller.generate({ user: { employee_id: 1 } }, { month: 6, year: 2026 })
     * 3. Assert: Service called with 6, 2026, 1
     * @TestData: month=6, year=2026, employee_id=1
     * @ExpectedResult: Summary object returned
     */
    it('should generate payslips for given period', async () => {
      mockService.generatePayslips.mockResolvedValue({ generated: 10, total_net: '50000000' });

      const result = await controller.generate(
        { user: { employee_id: 1 } },
        { month: 6, year: 2026 },
      );

      expect(result).toEqual({ generated: 10, total_net: '50000000' });
      expect(mockService.generatePayslips).toHaveBeenCalledWith(6, 2026, 1);
    });
  });

  // ==================== GENERATE SINGLE PAYSLIP ====================
  describe('generateSingle', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_02
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Generate single with missing employee_id should throw BadRequestException
     * @Steps:
     * 1. Arrange: body has no employee_id
     * 2. Act: Call controller.generateSingle
     * 3. Assert: BadRequestException thrown
     * @TestData: employee_id=undefined
     * @ExpectedResult: BadRequestException('Employee ID is required')
     */
    it('should throw BadRequestException when employee_id is missing', async () => {
      await expect(
        controller.generateSingle(
          { user: { employee_id: 1 } },
          { employee_id: undefined as any, month: 1, year: 2026 },
        )
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_PAY_CTRL_03
     * @Priority: P1
     * @Category: Positive
     * @Description: Generate single payslip with valid data should delegate to service
     * @Steps:
     * 1. Arrange: generateSinglePayslip returns payslip detail
     * 2. Act: Call controller.generateSingle
     * 3. Assert: Service called with correct params
     * @TestData: employee_id=2, month=6, year=2026
     * @ExpectedResult: Payslip detail returned
     */
    it('should generate single payslip for specified employee', async () => {
      mockService.generateSinglePayslip.mockResolvedValue({ payslip_id: 1 });

      const result = await controller.generateSingle(
        { user: { employee_id: 1 } },
        { employee_id: 2, month: 6, year: 2026 },
      );

      expect(result).toEqual({ payslip_id: 1 });
      expect(mockService.generateSinglePayslip).toHaveBeenCalledWith(2, 6, 2026, 1);
    });
  });

  // ==================== LIST PAYSLIPS ====================
  describe('list', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_04
     * @Priority: P1
     * @Category: Positive
     * @Description: List payslips should parse query params and delegate to service
     * @Steps:
     * 1. Arrange: getPayslipsByPeriod returns payslip list
     * 2. Act: Call controller.list({ month: '6', year: '2026' })
     * 3. Assert: Service called with 6, 2026
     * @TestData: month=6, year=2026
     * @ExpectedResult: Array of payslips
     */
    it('should list payslips by period with correct month/year parsing', async () => {
      mockService.getPayslipsByPeriod.mockResolvedValue([{ payslip_id: 1 }]);

      const result = await controller.list({ month: '6', year: '2026' });

      expect(result).toEqual([{ payslip_id: 1 }]);
      expect(mockService.getPayslipsByPeriod).toHaveBeenCalledWith(6, 2026);
    });
  });

  // ==================== MY PAYSLIPS ====================
  describe('getMyPayslips', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_05
     * @Priority: P1
     * @Category: Positive
     * @Description: Get my payslips should retrieve payslips for authenticated employee
     * @Steps:
     * 1. Arrange: getEmployeePayslips returns list
     * 2. Act: Call controller.getMyPayslips({ user: { employee_id: 1 } })
     * 3. Assert: Service called with employee_id=1
     * @TestData: employee_id=1
     * @ExpectedResult: Employee payslips
     */
    it('should return payslips for the authenticated employee', async () => {
      mockService.getEmployeePayslips.mockResolvedValue([{ payslip_id: 5 }]);

      const result = await controller.getMyPayslips({ user: { employee_id: 1 } });

      expect(result).toEqual([{ payslip_id: 5 }]);
      expect(mockService.getEmployeePayslips).toHaveBeenCalledWith(1);
    });
  });

  // ==================== APPROVE ALL ====================
  describe('approveAllPayslips', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_06
     * @Priority: P2
     * @Category: Positive
     * @Description: Approve all payslips should batch approve for given period
     * @Steps:
     * 1. Arrange: approveAllPayslips returns { approved: 5 }
     * 2. Act: Call controller.approveAllPayslips({ month: 6, year: 2026 })
     * 3. Assert: Service called with 6, 2026
     * @TestData: month=6, year=2026
     * @ExpectedResult: { approved: 5 }
     */
    it('should batch approve all payslips for a period', async () => {
      mockService.approveAllPayslips.mockResolvedValue({ approved: 5 });

      const result = await controller.approveAllPayslips({ month: 6, year: 2026 });

      expect(result).toEqual({ approved: 5 });
      expect(mockService.approveAllPayslips).toHaveBeenCalledWith(6, 2026);
    });
  });

  // ==================== GET PAYSLIP DETAIL ====================
  describe('getPayslipDetail', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_07
     * @Priority: P1
     * @Category: Positive
     * @Description: Admin user should be able to view any payslip regardless of ownership
     * @Steps:
     * 1. Arrange: getPayslipById returns payslip for employee 5, req.user is admin
     * 2. Act: Call controller.getPayslipDetail
     * 3. Assert: Payslip returned without ForbiddenException
     * @TestData: payslip of employee_id=5, viewer is admin
     * @ExpectedResult: Payslip detail returned
     */
    it('should allow admin to view any payslip', async () => {
      mockService.getPayslipById.mockResolvedValue({
        payslip_id: 1,
        employee: { employee_id: 5 },
      });
      const req = {
        user: {
          employee_id: 1,
          position: { position_name: 'Admin' },
          permissions: [],
        },
      };

      const result = await controller.getPayslipDetail(req, 1);

      expect(result.payslip_id).toBe(1);
      expect(mockService.getPayslipById).toHaveBeenCalledWith(1);
    });

    /**
     * @TestID: TC_BE_PAY_CTRL_08
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Non-admin user should be forbidden from viewing another employee's payslip
     * @Steps:
     * 1. Arrange: getPayslipById returns payslip for employee 5, req.user is staff (employee_id=1)
     * 2. Act: Call controller.getPayslipDetail
     * 3. Assert: ForbiddenException thrown
     * @TestData: payslip owner=5, viewer=1 (Staff)
     * @ExpectedResult: ForbiddenException('You are not authorized to view this payslip')
     */
    it('should forbid non-admin from viewing another employee payslip', async () => {
      mockService.getPayslipById.mockResolvedValue({
        payslip_id: 1,
        employee: { employee_id: 5 },
      });
      const req = {
        user: {
          employee_id: 1,
          position: { position_name: 'Staff' },
          permissions: [],
        },
      };

      await expect(controller.getPayslipDetail(req, 1)).rejects.toThrow(ForbiddenException);
    });

    /**
     * @TestID: TC_BE_PAY_CTRL_09
     * @Priority: P2
     * @Category: Positive
     * @Description: Employee should be able to view their own payslip
     * @Steps:
     * 1. Arrange: getPayslipById returns payslip for employee 1, req.user is employee 1
     * 2. Act: Call controller.getPayslipDetail
     * 3. Assert: Payslip returned
     * @TestData: employee views own payslip
     * @ExpectedResult: Payslip detail returned
     */
    it('should allow employee to view their own payslip', async () => {
      mockService.getPayslipById.mockResolvedValue({
        payslip_id: 1,
        employee: { employee_id: 1 },
      });
      const req = {
        user: {
          employee_id: 1,
          position: { position_name: 'Staff' },
          permissions: [],
        },
      };

      const result = await controller.getPayslipDetail(req, 1);

      expect(result.payslip_id).toBe(1);
    });
  });

  // ==================== APPROVE PAYSLIP ====================
  describe('approvePayslip', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_10
     * @Priority: P1
     * @Category: Positive
     * @Description: Approve payslip should change status to Approved
     * @Steps:
     * 1. Arrange: approvePayslip returns updated payslip
     * 2. Act: Call controller.approvePayslip(1)
     * 3. Assert: Service called with payslip_id=1
     * @TestData: payslip_id=1
     * @ExpectedResult: Approved payslip
     */
    it('should approve payslip by id', async () => {
      mockService.approvePayslip.mockResolvedValue({ payslip_id: 1, status: 'Approved' });

      const result = await controller.approvePayslip(1);

      expect(result.status).toBe('Approved');
      expect(mockService.approvePayslip).toHaveBeenCalledWith(1);
    });
  });

  // ==================== MARK PAYSLIP PAID ====================
  describe('markPayslipPaid', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_11
     * @Priority: P1
     * @Category: Positive
     * @Description: Mark payslip paid should change status to Paid
     * @Steps:
     * 1. Arrange: markPayslipPaid returns updated payslip
     * 2. Act: Call controller.markPayslipPaid(1)
     * 3. Assert: Service called with payslip_id=1
     * @TestData: payslip_id=1
     * @ExpectedResult: Paid payslip
     */
    it('should mark payslip as paid', async () => {
      mockService.markPayslipPaid.mockResolvedValue({ payslip_id: 1, status: 'Paid' });

      const result = await controller.markPayslipPaid(1);

      expect(result.status).toBe('Paid');
      expect(mockService.markPayslipPaid).toHaveBeenCalledWith(1);
    });
  });

  // ==================== SALARY CONFIG ====================
  describe('getSalaryConfig', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_12
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Get salary config with invalid employeeId (0) should throw BadRequestException
     * @Steps:
     * 1. Arrange: employeeId=0 (invalid, <= 0)
     * 2. Act: Call controller.getSalaryConfig(0)
     * 3. Assert: BadRequestException thrown
     * @TestData: employeeId=0
     * @ExpectedResult: BadRequestException
     */
    it('should throw BadRequestException for invalid employee ID', async () => {
      await expect(controller.getSalaryConfig(0)).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_PAY_CTRL_13
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Get salary config for employee without config should throw NotFoundException
     * @Steps:
     * 1. Arrange: getSalaryConfigByEmployeeId returns null
     * 2. Act: Call controller.getSalaryConfig(1)
     * 3. Assert: NotFoundException thrown
     * @TestData: employeeId=1, no config exists
     * @ExpectedResult: NotFoundException
     */
    it('should throw NotFoundException when salary config not found', async () => {
      mockService.getSalaryConfigByEmployeeId.mockResolvedValue(null);

      await expect(controller.getSalaryConfig(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== SALARY ADJUSTMENTS ====================
  describe('createAdjustment', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_14
     * @Priority: P1
     * @Category: Positive
     * @Description: Create salary adjustment should attach created_by_id from request
     * @Steps:
     * 1. Arrange: createAdjustment returns adjustment
     * 2. Act: Call controller.createAdjustment with body
     * 3. Assert: Service called with created_by_id from req.user
     * @TestData: employee_id=2, type=Bonus, amount=1000000, applied_month=06/2026
     * @ExpectedResult: Adjustment created with created_by_id=1
     */
    it('should create salary adjustment with creator id from request', async () => {
      mockService.createAdjustment.mockResolvedValue({ id: 10 });

      const result = await controller.createAdjustment(
        { user: { employee_id: 1 } },
        {
          employee_id: 2,
          type: AdjustmentType.BONUS,
          amount: '1000000',
          applied_month: '06/2026',
          reason: 'Performance bonus',
        },
      );

      expect(result).toEqual({ id: 10 });
      expect(mockService.createAdjustment).toHaveBeenCalledWith(
        expect.objectContaining({
          employee_id: 2,
          type: 'Bonus',
          amount: '1000000',
          created_by_id: 1,
        })
      );
    });
  });

  // ==================== PERIOD ====================
  describe('getPeriodByMonthYear', () => {
    /**
     * @TestID: TC_BE_PAY_CTRL_15
     * @Priority: P2
     * @Category: Positive
     * @Description: Get period by month/year should delegate to service
     * @Steps:
     * 1. Arrange: getPeriodByMonthYear returns period or null
     * 2. Act: Call controller.getPeriodByMonthYear({ month: '6', year: '2026' })
     * 3. Assert: Service called with 6, 2026
     * @TestData: month=6, year=2026
     * @ExpectedResult: Period object or null
     */
    it('should return payroll period info', async () => {
      const period = { id: 1, month: 6, year: 2026, status: 'Draft' };
      mockService.getPeriodByMonthYear.mockResolvedValue(period);

      const result = await controller.getPeriodByMonthYear({ month: '6', year: '2026' });

      expect(result).toEqual(period);
      expect(mockService.getPeriodByMonthYear).toHaveBeenCalledWith(6, 2026);
    });
  });
});
