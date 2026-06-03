import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payslip } from '../../entities/payslip.entity';
import { Employee } from '../../entities/employee.entity';
import { Department } from '../../entities/department.entity';
import { PayrollPeriod } from '../../entities/payroll-period.entity';
import { Contract } from '../../entities/contract.entity';
import { SalaryConfig } from '../../entities/salary-config.entity';

describe('ReportsService', () => {
  let service: ReportsService;

  const qbMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
  };

  const repoMockFactory = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(qbMock),
  });

  let payslipRepo: any, contractRepo: any, employeeRepo: any, periodRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Payslip), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Employee), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Department), useFactory: repoMockFactory },
        { provide: getRepositoryToken(PayrollPeriod), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Contract), useFactory: repoMockFactory },
        { provide: getRepositoryToken(SalaryConfig), useFactory: repoMockFactory },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    payslipRepo = module.get(getRepositoryToken(Payslip));
    contractRepo = module.get(getRepositoryToken(Contract));
    employeeRepo = module.get(getRepositoryToken(Employee));
    periodRepo = module.get(getRepositoryToken(PayrollPeriod));
    jest.clearAllMocks();
  });

  describe('payrollSummary', () => {
    // [TC_BE_REPORT_291]
    it('payrollSummary service: Xử lý dataset rỗng, trả về employees_processed = 0', async () => {
      payslipRepo.find.mockResolvedValue([]);
      const res = await service.payrollSummary(1, 2026);
      expect(res.employees_processed).toBe(0);
    });

    // [TC_BE_REPORT_292]
    it('payrollSummary service: Tính toán tổng lương và lương theo phòng ban từ payslip', async () => {
      payslipRepo.find.mockResolvedValue([
        { gross_salary: '100', net_salary: '90', bonus: '0', deductions: '10', employee: { department: { department_name: 'IT' } } }
      ]);
      const res = await service.payrollSummary(1, 2026);
      expect(res.employees_processed).toBe(1);
      expect(res.total_base_salary).toBe(100);
      expect(res.total_payroll).toBe(90);
      expect(res.payroll_by_department[0].avg).toBe(90);
    });
  });

  describe('getDashboardData', () => {
    // [TC_BE_REPORT_293]
    it('getDashboardData service: Tổng hợp dữ liệu dashboard (salary trend, headcount, turnover, personnel by dept)', async () => {
      // Mocking for 12 months execution logic accurately bridging abstractions securely
      periodRepo.findOne.mockResolvedValue(null);
      payslipRepo.find.mockResolvedValue([]);
      qbMock.getMany.mockResolvedValue([{ employee: { employee_id: 1 } }]);
      qbMock.getCount.mockResolvedValue(1);
      employeeRepo.find.mockResolvedValue([{ department: { department_name: 'IT' } }]);

      const res = await service.getDashboardData();

      expect(res.salary_trend.length).toBe(12);
      expect(res.headcount_trend.length).toBe(12);
      expect(res.turnover.length).toBe(12);
      expect(res.personnel_by_department[0].department_name).toBe('IT');
    });
  });
});
