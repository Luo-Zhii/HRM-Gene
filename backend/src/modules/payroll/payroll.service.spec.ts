import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { Contract } from '../../entities/contract.entity';
import { TimeKeeping } from '../../entities/timekeeping.entity';
import { Payslip, PayslipStatus } from '../../entities/payslip.entity';
import { PayrollPeriod } from '../../entities/payroll-period.entity';
import { SalaryConfig } from '../../entities/salary-config.entity';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { SalaryAdjustment, AdjustmentType, AdjustmentStatus } from '../../entities/salary-adjustment.entity';
import { LeaveBalance } from '../../entities/leave-balance.entity';
import { CompanySettings } from '../../entities/company-settings.entity';
import { Violation } from '../../entities/violation.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { KpiService } from '../kpi/kpi.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PayrollService', () => {
  let service: PayrollService;
  let module: TestingModule;

  // Re-create mock repo for each test to avoid cross-test contamination
  function createMockRepo() {
    return {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue(null),
        getRawMany: jest.fn().mockResolvedValue([]),
      }),
    };
  }

  let mockRepo: ReturnType<typeof createMockRepo>;

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  const mockKpiService = {
    getPeriodByMonthAndYear: jest.fn().mockResolvedValue(null),
    calculateFinalKpiScore: jest.fn().mockResolvedValue(0),
  };

  const mockDataSource = {
    transaction: jest.fn(),
    getRepository: jest.fn(),
    query: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    mockRepo = createMockRepo();
    module = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: KpiService, useValue: mockKpiService },
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
        { provide: getRepositoryToken(Contract), useValue: mockRepo },
        { provide: getRepositoryToken(TimeKeeping), useValue: mockRepo },
        { provide: getRepositoryToken(Payslip), useValue: mockRepo },
        { provide: getRepositoryToken(PayrollPeriod), useValue: mockRepo },
        { provide: getRepositoryToken(SalaryConfig), useValue: mockRepo },
        { provide: getRepositoryToken(LeaveRequest), useValue: mockRepo },
        { provide: getRepositoryToken(SalaryAdjustment), useValue: mockRepo },
        { provide: getRepositoryToken(LeaveBalance), useValue: mockRepo },
        { provide: getRepositoryToken(CompanySettings), useValue: mockRepo },
        { provide: getRepositoryToken(Violation), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
    mockNotificationsService.createNotification.mockResolvedValue({});
    mockDataSource.transaction.mockImplementation(async (cb: any) => {
      const manager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockImplementation((d: any) => d),
          save: jest.fn().mockResolvedValue({}),
        }),
      };
      return cb(manager);
    });
    mockDataSource.getRepository.mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    });
  });

  // ==================== PIT (Personal Income Tax) Calculation ====================
  describe('calculatePIT', () => {
    /**
     * @TestID: TC_BE_PAY_01
     * @Priority: P1
     * @Category: Positive
     * @Description: PIT should be 0 for taxable income <= 0
     * @Steps:
     * 1. Arrange: taxableIncome = 0
     * 2. Act: Call private calculatePIT(0)
     * 3. Assert: Returns 0
     * @TestData: taxableIncome=0
     * @ExpectedResult: 0
     */
    // [TC_BE_PAYROL_258]
    it('should return 0 tax for zero or negative taxable income', () => {
      const pit = (service as any).calculatePIT(0);
      expect(pit).toBe(0);
    });

    /**
     * @TestID: TC_BE_PAY_02
     * @Priority: P1
     * @Category: Positive
     * @Description: PIT bracket 1: up to 5M VND should be taxed at 5%
     * @Steps:
     * 1. Arrange: taxableIncome = 4,000,000
     * 2. Act: Call private calculatePIT(4000000)
     * 3. Assert: 4000000 * 0.05 = 200000
     * @TestData: taxableIncome=4,000,000 (Bracket 1)
     * @ExpectedResult: 200000
     */
    // [TC_BE_PAYROL_259]
    it('should calculate 5% tax for first bracket (<= 5M)', () => {
      const pit = (service as any).calculatePIT(4000000);
      expect(pit).toBe(200000);
    });

    /**
     * @TestID: TC_BE_PAY_03
     * @Priority: P1
     * @Category: Positive
     * @Description: PIT bracket 2: 5M-10M should apply 10% progressive rate
     * @Steps:
     * 1. Arrange: taxableIncome = 8,000,000
     * 2. Act: Call private calculatePIT(8000000)
     * 3. Assert: 5M*5% + 3M*10% = 250000 + 300000 = 550000
     * @TestData: taxableIncome=8,000,000 (Bracket 2)
     * @ExpectedResult: 550000
     */
    // [TC_BE_PAYROL_260]
    it('should calculate progressive tax for bracket 2 (5M-10M)', () => {
      const pit = (service as any).calculatePIT(8000000);
      // 5M * 0.05 = 250k, 3M * 0.10 = 300k, total = 550k
      expect(pit).toBe(550000);
    });

    /**
     * @TestID: TC_BE_PAY_04
     * @Priority: P1
     * @Category: Positive
     * @Description: PIT bracket 3: 10M-18M should apply 15% progressive rate
     * @Steps:
     * 1. Arrange: taxableIncome = 15,000,000
     * 2. Act: Call private calculatePIT(15000000)
     * 3. Assert: 5M*5% + 5M*10% + 5M*15% = 250k+500k+750k = 1,500,000
     * @TestData: taxableIncome=15,000,000 (Bracket 3)
     * @ExpectedResult: 1500000
     */
    // [TC_BE_PAYROL_261]
    it('should calculate progressive tax for bracket 3 (10M-18M)', () => {
      const pit = (service as any).calculatePIT(15000000);
      expect(pit).toBe(1500000);
    });

    /**
     * @TestID: TC_BE_PAY_05
     * @Priority: P1
     * @Category: Positive
     * @Description: PIT bracket 4: 18M-32M should apply 20% progressive rate
     * @Steps:
     * 1. Arrange: taxableIncome = 25,000,000
     * 2. Act: Call private calculatePIT(25000000)
     * 3. Assert: 5M*5% + 5M*10% + 8M*15% + 7M*20% = 250k+500k+1.2M+1.4M = 3,350,000
     * @TestData: taxableIncome=25,000,000 (Bracket 4)
     * @ExpectedResult: 3350000
     */
    // [TC_BE_PAYROL_262]
    it('should calculate progressive tax for bracket 4 (18M-32M)', () => {
      const pit = (service as any).calculatePIT(25000000);
      expect(pit).toBe(3350000);
    });

    /**
     * @TestID: TC_BE_PAY_06
     * @Priority: P1
     * @Category: Positive
     * @Description: PIT bracket 5: 32M-52M should apply 25% progressive rate
     * @Steps:
     * 1. Arrange: taxableIncome = 45,000,000
     * 2. Act: Call private calculatePIT(45000000)
     * 3. Assert: 5M*5% + 5M*10% + 8M*15% + 14M*20% + 13M*25% = 8,000,000
     * @TestData: taxableIncome=45,000,000 (Bracket 5)
     * @ExpectedResult: 8000000
     */
    // [TC_BE_PAYROL_263]
    it('should calculate progressive tax for bracket 5 (32M-52M)', () => {
      const pit = (service as any).calculatePIT(45000000);
      expect(pit).toBe(8000000);
    });

    /**
     * @TestID: TC_BE_PAY_07
     * @Priority: P1
     * @Category: Positive
     * @Description: PIT bracket 6: 52M-80M should apply 30% progressive rate
     * @Steps:
     * 1. Arrange: taxableIncome = 65,000,000
     * 2. Act: Call private calculatePIT(65000000)
     * 3. Assert: 5M*5% + 5M*10% + 8M*15% + 14M*20% + 20M*25% + 13M*30% = 13,650,000
     * @TestData: taxableIncome=65,000,000 (Bracket 6)
     * @ExpectedResult: 13650000
     */
    // [TC_BE_PAYROL_264]
    it('should calculate progressive tax for bracket 6 (52M-80M)', () => {
      const pit = (service as any).calculatePIT(65000000);
      expect(pit).toBe(13650000);
    });

    /**
     * @TestID: TC_BE_PAY_08
     * @Priority: P1
     * @Category: Positive
     * @Description: PIT bracket 7: above 80M should apply 35% progressive rate
     * @Steps:
     * 1. Arrange: taxableIncome = 100,000,000
     * 2. Act: Call private calculatePIT(100000000)
     * 3. Assert: All lower brackets + 20M*35% = 26,650,000
     * @TestData: taxableIncome=100,000,000 (Bracket 7)
     * @ExpectedResult: 25150000
     */
    // [TC_BE_PAYROL_265]
    it('should calculate progressive tax for bracket 7 (>80M)', () => {
      const pit = (service as any).calculatePIT(100000000);
      expect(pit).toBe(25150000);
    });
  });

  // ==================== GENERATE PAYSLIPS ====================
  describe('generatePayslips', () => {
    /**
     * @TestID: TC_BE_PAY_09
     * @Priority: P1
     * @Category: Positive
     * @Description: Generate payslips should create payroll period if it does not exist
     * @Steps:
     * 1. Arrange: payrollPeriodRepo.findOne returns null, payrollPeriodRepo.create + save returns new period
     * 2. Act: Call service.generatePayslips(6, 2026, 1)
     * 3. Assert: New period created, returned summary includes period_id
     * @TestData: month=6, year=2026, no existing period
     * @ExpectedResult: Summary with period_id and generated count
     */
    // [TC_BE_PAYROL_266]
    it('should create payroll period if it does not exist and return summary', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null); // no period
      mockRepo.create.mockReturnValue({
        month: 6, year: 2026, status: 'Draft', standard_work_days: 26,
      });
      mockRepo.save.mockResolvedValueOnce({
        id: 10, month: 6, year: 2026, status: 'Draft', standard_work_days: 26,
      });

      // employeeRepo.find returns empty employees
      mockRepo.find.mockResolvedValue([]);
      // timekeepingRepo.find returns empty
      mockRepo.find.mockResolvedValue([]);
      // leaveRequestRepo.find returns empty
      mockRepo.find.mockResolvedValue([]);
      // settingsRepo.findOne
      mockRepo.findOne.mockResolvedValue({ value: '10.5' });

      const result = await service.generatePayslips(6, 2026, 1);

      expect(result).toHaveProperty('period_id', 10);
      expect(result).toHaveProperty('month', 6);
      expect(result).toHaveProperty('year', 2026);
      expect(result).toHaveProperty('generated', 0);
    });
  });

  // ==================== GET PAYSLIP BY ID ====================
  describe('getPayslipById', () => {
    /**
     * @TestID: TC_BE_PAY_10
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Get payslip by non-existent ID should throw NotFoundException
     * @Steps:
     * 1. Arrange: payslipRepo.findOne returns null
     * 2. Act: Call service.getPayslipById(999)
     * 3. Assert: NotFoundException('Payslip #999 not found')
     * @TestData: payslip_id=999
     * @ExpectedResult: NotFoundException
     */
    // [TC_BE_PAYROL_267]
    it('should throw NotFoundException when payslip not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getPayslipById(999)).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_PAY_11
     * @Priority: P1
     * @Category: Positive
     * @Description: Get payslip by ID should return payslip detail with earnings and deductions breakdown
     * @Steps:
     * 1. Arrange: payslip found with employee, department, position relations
     * 2. Act: Call service.getPayslipById(1)
     * 3. Assert: Returns payslip with earnings array, deduction_items, net_pay_in_words, employee_name
     * @TestData: payslip_id=1 with Gross=12000000
     * @ExpectedResult: Detailed payslip with earnings, deductions, Vietnamese words
     */
    // [TC_BE_PAYROL_268]
    it('should return detailed payslip with earnings and deduction breakdown', async () => {
      mockRepo.findOne.mockResolvedValueOnce({
        payslip_id: 1,
        employee: {
          employee_id: 1,
          first_name: 'Admin',
          last_name: 'User',
          employment_status: 'Active',
          department: { department_name: 'Engineering' },
          position: { position_name: 'Director' },
        },
        payroll_period: { id: 1, month: 6, year: 2026, status: 'Draft', standard_work_days: 26 },
        bonus: '500000.00',
        deductions: '1260000.00',
        gross_salary: '12000000.00',
        net_salary: '10740000.00',
        kpi_bonus_amount: 0,
        pay_period: '06/2026',
        created_by_id: null,
      });
      // salaryConfigRepo.findOne
      mockRepo.findOne.mockResolvedValueOnce({
        base_salary: '12000000.00',
        transport_allowance: '0.00',
        lunch_allowance: '0.00',
        responsibility_allowance: '0.00',
        dependents_count: 0,
      });
      // timekeepingRepo.find
      mockRepo.find.mockResolvedValue([]);
      // leaveRequestRepo.find
      mockRepo.find.mockResolvedValue([]);
      // settingsRepo.findOne
      mockRepo.findOne.mockResolvedValueOnce({ value: '10.5' });
      // violationRepo.find
      mockRepo.find.mockResolvedValue([]);
      // adjustmentRepo.find
      mockRepo.find.mockResolvedValue([]);
      // employeeRepo.findOne for creator
      mockRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.getPayslipById(1);

      expect(result).toHaveProperty('payslip_id', 1);
      expect(result).toHaveProperty('earnings');
      expect(result).toHaveProperty('deduction_items');
      expect(result).toHaveProperty('net_pay_in_words');
      expect(result).toHaveProperty('employee_name', 'Admin User');
    });
  });

  // ==================== APPROVE PAYSLIP ====================
  describe('approvePayslip', () => {
    /**
     * @TestID: TC_BE_PAY_12
     * @Priority: P1
     * @Category: Positive
     * @Description: Approve payslip should change status to Approved and send notification
     * @Steps:
     * 1. Arrange: payslip found with Pending status
     * 2. Act: Call service.approvePayslip(1)
     * 3. Assert: Status changed to Approved, notification sent
     * @TestData: payslip_id=1
     * @ExpectedResult: Approved payslip, notification created
     */
    // [TC_BE_PAYROL_269]
    it('should approve payslip and send notification', async () => {
      mockRepo.findOne.mockResolvedValue({
        payslip_id: 1,
        status: PayslipStatus.PENDING,
        employee: { employee_id: 1 },
        payroll_period: { month: 6, year: 2026 },
      });
      mockRepo.save.mockResolvedValue({
        payslip_id: 1,
        status: PayslipStatus.APPROVED,
        employee: { employee_id: 1 },
      });

      const result = await service.approvePayslip(1);

      expect(result.status).toBe(PayslipStatus.APPROVED);
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_PAY_13
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Approve non-existent payslip should throw NotFoundException
     * @Steps:
     * 1. Arrange: payslipRepo.findOne returns null
     * 2. Act: Call service.approvePayslip(999)
     * 3. Assert: NotFoundException
     * @TestData: payslip_id=999
     * @ExpectedResult: NotFoundException
     */
    // [TC_BE_PAYROL_270]
    it('should throw NotFoundException when payslip not found for approval', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.approvePayslip(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== MARK PAYSLIP PAID ====================
  describe('markPayslipPaid', () => {
    /**
     * @TestID: TC_BE_PAY_14
     * @Priority: P1
     * @Category: Positive
     * @Description: Mark payslip paid should change status to Paid and notify employee
     * @Steps:
     * 1. Arrange: payslip found, status set to Paid
     * 2. Act: Call service.markPayslipPaid(1)
     * 3. Assert: Status changed to Paid, notification sent with net salary amount
     * @TestData: payslip_id=1, net_salary=10740000
     * @ExpectedResult: Paid payslip, notification sent
     */
    // [TC_BE_PAYROL_271]
    it('should mark payslip as paid and notify employee', async () => {
      mockRepo.findOne.mockResolvedValue({
        payslip_id: 1,
        status: PayslipStatus.APPROVED,
        net_salary: '10740000.00',
        employee: { employee_id: 1 },
        payroll_period: { month: 6, year: 2026 },
      });
      mockRepo.save.mockResolvedValue({
        payslip_id: 1,
        status: PayslipStatus.PAID,
      });

      const result = await service.markPayslipPaid(1);

      expect(result.status).toBe(PayslipStatus.PAID);
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_PAY_15
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Mark non-existent payslip as paid should throw NotFoundException
     * @Steps:
     * 1. Arrange: payslipRepo.findOne returns null
     * 2. Act: Call service.markPayslipPaid(999)
     * 3. Assert: NotFoundException
     * @TestData: payslip_id=999
     * @ExpectedResult: NotFoundException
     */
    // [TC_BE_PAYROL_272]
    it('should throw NotFoundException when payslip not found for mark paid', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.markPayslipPaid(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== APPROVE ALL PAYSLIPS ====================
  describe('approveAllPayslips', () => {
    /**
     * @TestID: TC_BE_PAY_16
     * @Priority: P1
     * @Category: Positive
     * @Description: Approve all pending payslips for a period should batch approve
     * @Steps:
     * 1. Arrange: Period found, 3 pending payslips found
     * 2. Act: Call service.approveAllPayslips(6, 2026)
     * 3. Assert: All approved, returns { approved: 3 }
     * @TestData: month=6, year=2026, 3 pending payslips
     * @ExpectedResult: { approved: 3 }
     */
    // [TC_BE_PAYROL_273]
    it('should batch approve all pending payslips for a period', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, month: 6, year: 2026 });
      mockRepo.find.mockResolvedValue([
        { payslip_id: 1, status: PayslipStatus.PENDING, employee: { employee_id: 1 } },
        { payslip_id: 2, status: PayslipStatus.PENDING, employee: { employee_id: 2 } },
        { payslip_id: 3, status: PayslipStatus.PENDING, employee: { employee_id: 3 } },
      ]);
      mockRepo.save.mockResolvedValue({});

      const result = await service.approveAllPayslips(6, 2026);

      expect(result.approved).toBe(3);
    });

    /**
     * @TestID: TC_BE_PAY_17
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Approve all for non-existent period should throw NotFoundException
     * @Steps:
     * 1. Arrange: payrollPeriodRepo.findOne returns null
     * 2. Act: Call service.approveAllPayslips(13, 2026)
     * 3. Assert: NotFoundException
     * @TestData: month=13 (invalid)
     * @ExpectedResult: NotFoundException
     */
    // [TC_BE_PAYROL_274]
    it('should throw NotFoundException when payroll period not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.approveAllPayslips(13, 2026))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ==================== SALARY ADJUSTMENTS ====================
  describe('createAdjustment', () => {
    /**
     * @TestID: TC_BE_PAY_18
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Create adjustment for non-existent employee should throw NotFoundException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null
     * 2. Act: Call service.createAdjustment({ employee_id: 999, type: AdjustmentType.BONUS, amount: '1000000', applied_month: '06/2026' })
     * 3. Assert: NotFoundException
     * @TestData: employee_id=999
     * @ExpectedResult: NotFoundException('Employee #999 not found')
     */
    // [TC_BE_PAYROL_275]
    it('should throw NotFoundException when employee not found for adjustment', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createAdjustment({
          employee_id: 999,
          type: AdjustmentType.BONUS,
          amount: '1000000',
          applied_month: '06/2026',
        })
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_PAY_19
     * @Priority: P1
     * @Category: Positive
     * @Description: Create bonus adjustment should save and send notification
     * @Steps:
     * 1. Arrange: Employee found, adjustment created with type=Bonus
     * 2. Act: Call service.createAdjustment({ employee_id: 1, type: AdjustmentType.BONUS, amount: '2000000', applied_month: '06/2026', reason: 'Performance' })
     * 3. Assert: Adjustment saved with status=Pending, notification sent
     * @TestData: Bonus 2,000,000 VND for employee 1, month 06/2026, reason='Performance'
     * @ExpectedResult: Saved adjustment with Pending status
     */
    // [TC_BE_PAYROL_276]
    it('should create bonus adjustment with notification', async () => {
      mockRepo.findOne.mockResolvedValue({ employee_id: 1 });
      mockRepo.create.mockReturnValue({
        employee: { employee_id: 1 },
        type: AdjustmentType.BONUS,
        amount: '2000000',
        applied_month: '06/2026',
        reason: 'Performance',
        status: AdjustmentStatus.PENDING,
      });
      mockRepo.save.mockResolvedValue({
        id: 1,
        type: AdjustmentType.BONUS,
        amount: '2000000',
        applied_month: '06/2026',
        status: AdjustmentStatus.PENDING,
      });

      const result = await service.createAdjustment({
        employee_id: 1,
        type: AdjustmentType.BONUS,
        amount: '2000000',
        applied_month: '06/2026',
        reason: 'Performance',
      });

      expect(result.type).toBe(AdjustmentType.BONUS);
      expect(result.status).toBe(AdjustmentStatus.PENDING);
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_PAY_20
     * @Priority: P2
     * @Category: Positive
     * @Description: Create penalty adjustment should save correctly
     * @Steps:
     * 1. Arrange: Employee found, adjustment created with type=Penalty
     * 2. Act: Call service.createAdjustment({ employee_id: 1, type: AdjustmentType.PENALTY, amount: '500000', applied_month: '06/2026', reason: 'Unauthorized absence' })
     * 3. Assert: Saved as Penalty type
     * @TestData: Penalty 500,000 VND, reason='Unauthorized absence'
     * @ExpectedResult: Saved penalty adjustment
     */
    // [TC_BE_PAYROL_277]
    it('should create penalty adjustment', async () => {
      mockRepo.findOne.mockResolvedValue({ employee_id: 1 });
      mockRepo.create.mockReturnValue({
        employee: { employee_id: 1 },
        type: AdjustmentType.PENALTY,
        amount: '500000',
        applied_month: '06/2026',
        reason: 'Unauthorized absence',
        status: AdjustmentStatus.PENDING,
      });
      mockRepo.save.mockResolvedValue({
        id: 2,
        type: AdjustmentType.PENALTY,
        amount: '500000',
        applied_month: '06/2026',
        status: AdjustmentStatus.PENDING,
      });

      const result = await service.createAdjustment({
        employee_id: 1,
        type: AdjustmentType.PENALTY,
        amount: '500000',
        applied_month: '06/2026',
        reason: 'Unauthorized absence',
      });

      expect(result.type).toBe(AdjustmentType.PENALTY);
    });
  });

  // ==================== GET SALARY CONFIG BY EMPLOYEE ID ====================
  describe('getSalaryConfigByEmployeeId', () => {
    /**
     * @TestID: TC_BE_PAY_21
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Get salary config with invalid employee ID (NaN) should throw BadRequestException
     * @Steps:
     * 1. Arrange: employeeId=NaN
     * 2. Act: Call service.getSalaryConfigByEmployeeId(NaN)
     * 3. Assert: BadRequestException
     * @TestData: employeeId=NaN
     * @ExpectedResult: BadRequestException
     */
    // [TC_BE_PAYROL_278]
    it('should throw BadRequestException for NaN employee ID', async () => {
      await expect(
        service.getSalaryConfigByEmployeeId(NaN)
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_PAY_22
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Get salary config with invalid employee ID (<= 0) should throw BadRequestException
     * @Steps:
     * 1. Arrange: employeeId=0
     * 2. Act: Call service.getSalaryConfigByEmployeeId(0)
     * 3. Assert: BadRequestException
     * @TestData: employeeId=0
     * @ExpectedResult: BadRequestException
     */
    // [TC_BE_PAYROL_279]
    it('should throw BadRequestException for zero or negative employee ID', async () => {
      await expect(
        service.getSalaryConfigByEmployeeId(0)
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getSalaryConfigByEmployeeId(-1)
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_PAY_23
     * @Priority: P2
     * @Category: Positive
     * @Description: Get salary config for existing employee should return config
     * @Steps:
     * 1. Arrange: createQueryBuilder returns salary config
     * 2. Act: Call service.getSalaryConfigByEmployeeId(1)
     * 3. Assert: Returns salary config object
     * @TestData: employeeId=1 with base_salary=60000000
     * @ExpectedResult: SalaryConfig with employee relation
     */
    // [TC_BE_PAYROL_280]
    it('should return salary config when employee has configuration', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          config_id: 1,
          base_salary: '60000000.00',
          transport_allowance: '0.00',
          lunch_allowance: '0.00',
          responsibility_allowance: '0.00',
          employee: { employee_id: 1 },
        }),
      };
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getSalaryConfigByEmployeeId(1);

      expect(result).toHaveProperty('base_salary', '60000000.00');
    });
  });

  // ==================== DELETE ADJUSTMENT ====================
  describe('deleteAdjustment', () => {
    /**
     * @TestID: TC_BE_PAY_24
     * @Priority: P2
     * @Category: Positive
     * @Description: Delete existing adjustment should remove it and return success
     * @Steps:
     * 1. Arrange: adjustment found
     * 2. Act: Call service.deleteAdjustment(1)
     * 3. Assert: Adj removed, returns { deleted: true, id: 1 }
     * @TestData: adjustment_id=1
     * @ExpectedResult: { deleted: true, id: 1 }
     */
    // [TC_BE_PAYROL_281]
    it('should delete adjustment and return success', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1 });
      mockRepo.remove.mockResolvedValue({});

      const result = await service.deleteAdjustment(1);

      expect(result).toEqual({ deleted: true, id: 1 });
    });
  });

  // ==================== GENERATE SINGLE PAYSLIP ====================
  describe('generateSinglePayslip', () => {
    /**
     * @TestID: TC_BE_PAY_25
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Generate single payslip for non-existent employee should throw NotFoundException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null
     * 2. Act: Call service.generateSinglePayslip(999, 6, 2026, 1)
     * 3. Assert: NotFoundException
     * @TestData: employeeId=999
     * @ExpectedResult: NotFoundException
     */
    // [TC_BE_PAYROL_282]
    it('should throw NotFoundException when employee not found for single payslip', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.generateSinglePayslip(999, 6, 2026, 1)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
