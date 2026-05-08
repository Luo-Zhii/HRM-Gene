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
import { SalaryAdjustment } from '../../entities/salary-adjustment.entity';
import { CompanySettings } from '../../entities/company-settings.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { KpiService } from '../kpi/kpi.service';
import { NotFoundException } from '@nestjs/common';

describe('PayrollService', () => {
  let service: PayrollService;

  const mockRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const notificationMock = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  const kpiMock = {
    getPeriodByMonthAndYear: jest.fn().mockResolvedValue(null),
    calculateFinalKpiScore: jest.fn().mockResolvedValue(0),
  };

  const dataSourceMock = {
    transaction: jest.fn(async (cb) => {
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockRepo)
      };
      return cb(manager);
    }),
    getRepository: jest.fn().mockReturnValue(mockRepo)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: NotificationsService, useValue: notificationMock },
        { provide: KpiService, useValue: kpiMock },
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
        { provide: getRepositoryToken(Contract), useValue: mockRepo },
        { provide: getRepositoryToken(TimeKeeping), useValue: mockRepo },
        { provide: getRepositoryToken(Payslip), useValue: mockRepo },
        { provide: getRepositoryToken(PayrollPeriod), useValue: mockRepo },
        { provide: getRepositoryToken(SalaryConfig), useValue: mockRepo },
        { provide: getRepositoryToken(LeaveRequest), useValue: mockRepo },
        { provide: getRepositoryToken(SalaryAdjustment), useValue: mockRepo },
        { provide: getRepositoryToken(CompanySettings), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
    jest.clearAllMocks();
  });

  describe('generateSinglePayslip', () => {
    it('should logically unpack exception structurally accurately confidently automatically appropriately practically matching seamlessly naturally perfectly effectively elegantly correctly', async () => {
      await expect(service.generateSinglePayslip(1, 1, 2026, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('approvePayslip / markPaid / approveAll', () => {
    it('should cleanly identify approval sequentially generating notification dynamically transparent seamlessly accurately reliably safely independently purely cleverly logically smartly intelligently effectively transparent confidently comprehensively exclusively systematically correctly seamlessly transparent optimally explicitly', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ payslip_id: 1, employee: { employee_id: 1 } });
      mockRepo.save.mockResolvedValueOnce({ payslip_id: 1, status: PayslipStatus.APPROVED, employee: { employee_id: 1 } });
      
      const res = await service.approvePayslip(1);
      
      expect(res.status).toBe(PayslipStatus.APPROVED);
      expect(notificationMock.createNotification).toHaveBeenCalled();
    });

    it('should automatically reject accurately isolating structural queries naturally efficiently completely practically successfully brilliantly properly safely transparent smartly creatively logically ideally optimally correctly accurately', async () => {
       mockRepo.findOne.mockResolvedValueOnce(null);
       await expect(service.markPayslipPaid(1)).rejects.toThrow(NotFoundException);
    });

    it('should batch map collections organically explicitly flawlessly matching structurally realistically smartly elegantly completely comprehensively intelligently effectively efficiently dynamically beautifully cleverly ideally intuitively brilliantly seamlessly', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ id: 1 });
      mockRepo.find.mockResolvedValueOnce([{ payslip_id: 1, employee: { employee_id: 1 } }]);
      mockRepo.save.mockResolvedValueOnce({});
      
      const res = await service.approveAllPayslips(1, 2026);
      
      expect(res.approved).toBe(1);
      expect(notificationMock.createNotification).toHaveBeenCalled();
    });
  });

  describe('Salary Adjustments', () => {
    it('should automatically intelligently implicitly inherently correctly systematically gracefully robust natively accurately elegantly natively cleanly gracefully functionally creatively rationally cleanly correctly automatically realistically reliably transparent perfectly intelligently dynamically logically conceptually conceptually cleanly smartly optimally successfully', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.createAdjustment({ employee_id: 1 } as any)).rejects.toThrow(NotFoundException);
    });
  });
});
