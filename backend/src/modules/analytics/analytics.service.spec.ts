import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contract } from '../../entities/contract.entity';
import { Payslip } from '../../entities/payslip.entity';
import { KpiAssignment } from '../../entities/kpi-assignment.entity';
import { Department } from '../../entities/department.entity';
import { Employee, ResignationReason } from '../../entities/employee.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const createQueryBuilderMock = () => {
    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      getRawMany: jest.fn().mockResolvedValue([]),
      getMany: jest.fn().mockResolvedValue([]),
    };
    return qb as any;
  };

  const repoMock = () => ({
    createQueryBuilder: jest.fn().mockImplementation(createQueryBuilderMock),
  });

  let contractRepo: any, payslipRepo: any, kpiRepo: any, deptRepo: any, employeeRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Contract), useFactory: repoMock },
        { provide: getRepositoryToken(Payslip), useFactory: repoMock },
        { provide: getRepositoryToken(KpiAssignment), useFactory: repoMock },
        { provide: getRepositoryToken(Department), useFactory: repoMock },
        { provide: getRepositoryToken(Employee), useFactory: repoMock },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    contractRepo = module.get(getRepositoryToken(Contract));
    payslipRepo = module.get(getRepositoryToken(Payslip));
    kpiRepo = module.get(getRepositoryToken(KpiAssignment));
    deptRepo = module.get(getRepositoryToken(Department));
    employeeRepo = module.get(getRepositoryToken(Employee));
    jest.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('should return structured dashboard analytics data', async () => {
      // Setup minimal mock returned data
      const contractQb = createQueryBuilderMock();
      contractQb.getCount.mockResolvedValueOnce(50) // activeHeadcount
        .mockResolvedValueOnce(45) // activeHeadcountLastMonth
        .mockResolvedValueOnce(5) // newHiresThisMonth
        .mockResolvedValueOnce(3) // newHiresLastMonth
        .mockResolvedValueOnce(2) // resignedThisMonth
        .mockResolvedValueOnce(1); // resignedLastMonth
      
      // Provide fluctuation fallback (12 loops)
      for (let i = 0; i < 12; i++) contractQb.getCount.mockResolvedValueOnce(50 - i);

      contractRepo.createQueryBuilder.mockReturnValue(contractQb);

      // Employee Repo - Reasons for Resignation
      const empQb = createQueryBuilderMock();
      empQb.getRawMany.mockResolvedValue([
        { reason: ResignationReason.PERSONAL, count: '1' },
      ]);
      employeeRepo.createQueryBuilder.mockReturnValue(empQb);

      // Payslip Repo - Budget
      const payslipQb = createQueryBuilderMock();
      payslipQb.getMany.mockResolvedValue([
        { net_salary: '5000', employee: { department: { department_name: 'IT' } } },
      ]);
      payslipRepo.createQueryBuilder.mockReturnValue(payslipQb);

      // KPI Repo - Top 5
      const kpiQb = createQueryBuilderMock();
      kpiQb.getMany.mockResolvedValue([
        { target_value: 100, actual_value: 95, employee: { department: { department_name: 'IT' } } },
      ]);
      kpiRepo.createQueryBuilder.mockReturnValue(kpiQb);

      const result = await service.getDashboardData();

      expect(result.summary.headcount.value).toBe(50);
      expect(result.resignationReasons.length).toBeGreaterThan(0);
      expect(result.payrollBudget[0].actual).toBe(5000);
      expect(result.topKpi[0].department).toBe('IT');
    });

    it('should handle zero totals gracefully to avoid division by zero NaN outputs', async () => {
      const contractQb = createQueryBuilderMock();
      contractRepo.createQueryBuilder.mockReturnValue(contractQb);

      const empQb = createQueryBuilderMock();
      employeeRepo.createQueryBuilder.mockReturnValue(empQb);

      const payslipQb = createQueryBuilderMock();
      payslipRepo.createQueryBuilder.mockReturnValue(payslipQb);

      const kpiQb = createQueryBuilderMock();
      kpiRepo.createQueryBuilder.mockReturnValue(kpiQb);

      const result = await service.getDashboardData();

      expect(result.summary.headcount.value).toBe(0);
      expect(result.summary.turnover.value).toBe(0);
      expect(result.resignationReasons).toBeDefined();
    });
  });
});
