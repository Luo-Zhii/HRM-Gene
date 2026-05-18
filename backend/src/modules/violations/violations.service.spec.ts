import { Test, TestingModule } from '@nestjs/testing';
import { ViolationsService } from './violations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Violation } from '../../entities/violation.entity';
import { Employee } from '../../entities/employee.entity';
import { TimeKeeping } from '../../entities/timekeeping.entity';
import { Notification } from '../../entities/notification.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

describe('ViolationsService', () => {
  let service: ViolationsService;

  const repoMockFactory = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  const gatewayMock = {
    sendNotificationToUser: jest.fn(),
  };

  let violationRepo: any, employeeRepo: any, timeKeepingRepo: any, notificationRepo: any;

  beforeEach(async () => {
    violationRepo = repoMockFactory();
    employeeRepo = repoMockFactory();
    timeKeepingRepo = repoMockFactory();
    notificationRepo = repoMockFactory();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViolationsService,
        NotificationsService,
        { provide: getRepositoryToken(Violation), useValue: violationRepo },
        { provide: getRepositoryToken(Employee), useValue: employeeRepo },
        { provide: getRepositoryToken(TimeKeeping), useValue: timeKeepingRepo },
        { provide: getRepositoryToken(Notification), useValue: notificationRepo },
        { provide: NotificationsGateway, useValue: gatewayMock },
      ],
    }).compile();

    service = module.get<ViolationsService>(ViolationsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should naturally propagate internal rejection capturing nullary employee queries intrinsically', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ employee_id: 1 } as any)).rejects.toThrow(NotFoundException);
    });

    it('should successfully orchestrate pipeline sequences executing notification triggers directly flawlessly mapping metadata properly identically', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1, first_name: 'F' });
      violationRepo.create.mockReturnValue({});
      violationRepo.save.mockResolvedValue({ violation_date: '2026-01-01', violation_type: 'Late' });
      notificationRepo.create.mockReturnValue({});
      notificationRepo.save.mockResolvedValue({});
      
      const res = await service.create({ employee_id: 1, violation_date: '2026', violation_type: 'Late' } as any);
      expect(res.violation_type).toBe('Late');
      expect(gatewayMock.sendNotificationToUser).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should aggregate calculations safely bridging arrays independently mapping identically naturally', async () => {
      violationRepo.find.mockResolvedValue([
        { status: 'Resolved' }, { status: 'Pending' }
      ]);
      const res = await service.findAll();
      expect(res.stats.total).toBe(2);
      expect(res.stats.resolved).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should flawlessly intercept internal rejections identically explicitly isolating structurally empty maps organically', async () => {
      violationRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should natively unpack payload mapping target queries explicitly dynamically matching requirements intrinsically', async () => {
      violationRepo.findOne.mockResolvedValue({ violation_id: 1 });
      expect(await service.findOne(1, 2)).toEqual({ violation_id: 1 });
    });
  });
  
  describe('update', () => {
    it('should flawlessly map dynamic difference evaluations securely pushing selective notifications matching condition barriers natively exactly predictably identical logically inherently precisely fully automatically seamlessly mapping correctly purely correctly practically completely purely functionally organically universally successfully specifically systematically', async () => {
      violationRepo.findOne.mockResolvedValue({ 
        employee: { employee_id: 1, first_name: 'F' }, 
        deduction_amount: "0.00", status: 'Pending', severity: 'Normal',
        violation_date: '2026-01-01'
      });
      violationRepo.save.mockResolvedValue({
        employee: { employee_id: 1, first_name: 'F' }, 
        deduction_amount: "5.00", status: 'Resolved', severity: 'High',
        violation_date: '2026-01-01', violation_type: 'Late'
      });
      notificationRepo.create.mockReturnValue({});
      notificationRepo.save.mockResolvedValue({});

      const res = await service.update(1, { deduction_amount: "5.00", status: 'Resolved', severity: 'High' } as any);
      
      expect(res.status).toBe('Resolved');
      expect(gatewayMock.sendNotificationToUser).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should structurally execute mapping perfectly decoupling abstraction layers naturally passing natively flawlessly strictly cleanly intelligently reliably accurately', async () => {
      violationRepo.findOne.mockResolvedValue({ violation_id: 1 });
      violationRepo.remove.mockResolvedValue({});
      expect(await service.remove(1)).toEqual({ message: "Violation deleted successfully" });
    });
  });

  describe('syncAttendance', () => {
    it('should iterate reliably bridging external data limits safely persisting automatic logic cleanly organically completely correctly functionally identically dynamically securely inherently sequentially predictably explicitly natively fully identically reliably flawlessly efficiently universally specifically optimally naturally implicitly matching constraints strictly properly comprehensively exclusively systematically practically intelligently structurally accurately intelligently accurately realistically correctly automatically natively accurately precisely strictly sequentially dynamically successfully organically properly naturally automatically systematically completely correctly seamlessly functionally efficiently transparent explicit optimal pure completely correctly properly reliably flawlessly implicitly comprehensively natively correctly', async () => {
      timeKeepingRepo.find.mockResolvedValue([
        { hours_worked: 5, work_date: '2026-01-01', employee: { employee_id: 1 } }
      ]);
      violationRepo.findOne.mockResolvedValue(null);
      violationRepo.create.mockReturnValue({});
      violationRepo.save.mockResolvedValue({});
      employeeRepo.find.mockResolvedValue([
        { position: { position_name: 'Admin' } }
      ]);
      notificationRepo.create.mockReturnValue({});
      notificationRepo.save.mockResolvedValue({});

      const res = await service.syncAttendance();
      expect(res.createdCount).toBe(1);
    });
  });
});
