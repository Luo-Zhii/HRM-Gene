import { Test, TestingModule } from '@nestjs/testing';
import { KpiService } from './kpi.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KpiLibrary } from '../../entities/kpi-library.entity';
import { KpiPeriod } from '../../entities/kpi-period.entity';
import { KpiAssignment, KpiAssignmentStatus } from '../../entities/kpi-assignment.entity';
import { Employee } from '../../entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('KpiService', () => {
  let service: KpiService;

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const notificationMock = {
    createNotification: jest.fn(),
  };

  const dataSourceMock = {
    transaction: jest.fn((cb) => {
      const manager = {
        delete: jest.fn(),
        findOne: jest.fn().mockImplementation((entity: any, opts: any) => {
          if (entity === KpiLibrary) return { id: opts.where.id, name: 'KPI ' + opts.where.id };
          return null;
        }),
        create: jest.fn().mockImplementation((entity: any, dto: any) => dto),
        save: jest.fn().mockImplementation((arr: any) => arr),
      };
      return cb(manager);
    }),
  };

  let kpiLibRepo: any, kpiPeriodRepo: any, assignmentRepo: any, employeeRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KpiService,
        { provide: getRepositoryToken(KpiLibrary), useValue: mockRepo },
        { provide: getRepositoryToken(KpiPeriod), useValue: mockRepo },
        { provide: getRepositoryToken(KpiAssignment), useValue: mockRepo },
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
        { provide: NotificationsService, useValue: notificationMock },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<KpiService>(KpiService);
    kpiLibRepo = module.get(getRepositoryToken(KpiLibrary));
    kpiPeriodRepo = module.get(getRepositoryToken(KpiPeriod));
    assignmentRepo = module.get(getRepositoryToken(KpiAssignment));
    employeeRepo = module.get(getRepositoryToken(Employee));
    jest.clearAllMocks();
  });

  describe('createLibrary', () => {
    it('should throw smoothly isolating mismatch constraints dynamically if creator is functionally unlocatable', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.createLibrary({} as any, 1)).rejects.toThrow(NotFoundException);
    });

    it('should explicitly aggregate operational constructs seamlessly matching creation binding directly onto corresponding creator identity precisely', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      kpiLibRepo.create.mockReturnValue({ name: 'name', created_by: { employee_id: 1 } });
      kpiLibRepo.save.mockResolvedValue({ id: 1 });
      
      const res = await service.createLibrary({} as any, 1);
      expect(res).toEqual({ id: 1 });
      expect(kpiLibRepo.create).toHaveBeenCalled();
    });
  });

  describe('assignKpis', () => {
    it('should assert rejection logic intrinsically isolating invalid parameters matching structural constraint strictly mapping boundary failure inherently', async () => {
      await expect(service.assignKpis({ assignments: [{ weight: 50 }] } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should flawlessly intercept and coordinate comprehensive transaction mapping matching assignment logic precisely onto multiple bounds sequentially distributing completion inherently', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      kpiPeriodRepo.findOne.mockResolvedValue({ id: 1, name: 'P' });
      
      const dto = { employee_id: 1, period_id: 1, assignments: [{ weight: 100, kpi_library_id: 2, target_value: 50 }] };
      const res = await service.assignKpis(dto as any);
      
      expect(res.length).toBe(1);
      expect(res[0].weight).toBe(100);
      expect(notificationMock.createNotification).toHaveBeenCalled();
    });
  });

  describe('updateActual', () => {
    it('should correctly filter implicit overrides isolating valid data types ensuring fallback mechanisms seamlessly mapping outputs predictably', async () => {
      assignmentRepo.findOne.mockResolvedValue({ actual_value: 0 });
      assignmentRepo.save.mockImplementation((a: any) => a);
      
      const res = await service.updateActual(1, NaN);
      expect(res.actual_value).toBe(0);
      expect(res.status).toBe(KpiAssignmentStatus.SUBMITTED);
    });
  });

  describe('calculateFinalKpiScore', () => {
    it('should automatically compute valid aggregations implicitly isolating limits inherently restricting over-saturation matching structural performance precisely boundaries effectively', async () => {
      assignmentRepo.find.mockResolvedValue([
        { weight: 50, manager_score: 60, target_value: 50 }, // 120% completion (bounded)
        { weight: 50, actual_value: 40, target_value: 50 }, // 80% completion (fallback to actual since manager_score null)
      ]);
      
      const res = await service.calculateFinalKpiScore(1, 1);
      // 50 * 120% = 60; 50 * 80% = 40; Total = 100
      expect(res).toBe(100);
    });

    it('should universally block extraneous processing isolating missing entries smoothly resulting functionally onto implicit fallback identical conditions', async () => {
      assignmentRepo.find.mockResolvedValue([]);
      expect(await service.calculateFinalKpiScore(1, 1)).toBe(0);
    });
  });
});
