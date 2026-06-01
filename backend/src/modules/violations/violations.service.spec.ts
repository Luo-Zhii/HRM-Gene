import { Test, TestingModule } from '@nestjs/testing';
import { ViolationsService } from './violations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Violation, ViolationStatus, ViolationSeverity } from '../../entities/violation.entity';
import { Employee } from '../../entities/employee.entity';
import { TimeKeeping } from '../../entities/timekeeping.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ViolationsService', () => {
  let service: ViolationsService;

  const mockViolationRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockEmployeeRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTimeKeepingRepo = {
    find: jest.fn(),
  };

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViolationsService,
        { provide: getRepositoryToken(Violation), useValue: mockViolationRepo },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: getRepositoryToken(TimeKeeping), useValue: mockTimeKeepingRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ViolationsService>(ViolationsService);
    jest.clearAllMocks();
  });

  // ==================== CREATE ====================
  describe('create', () => {
    /**
     * @TestID: TC_BE_VIOL_01
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Create violation for non-existent employee should throw NotFoundException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null
     * 2. Act: Call service.create({ employee_id: 999, violation_date: '2026-06-01', violation_type: 'Late', description: 'Late to work' })
     * 3. Assert: NotFoundException('Employee not found')
     * @TestData: employee_id=999 (non-existent)
     * @ExpectedResult: NotFoundException
     */
    it('should throw NotFoundException when employee not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          employee_id: 999,
          violation_date: '2026-06-01',
          violation_type: 'Late',
          description: 'Late to work',
        })
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_VIOL_02
     * @Priority: P1
     * @Category: Positive
     * @Description: Create violation with valid data should save and send notification
     * @Steps:
     * 1. Arrange: Employee found, violation created and saved
     * 2. Act: Call service.create({ employee_id: 1, violation_date: '2026-06-01', violation_type: 'Late', description: 'Arrived 30 min late', deduction_amount: '50000', severity: ViolationSeverity.NORMAL })
     * 3. Assert: Violation saved, notification sent
     * @TestData: Late violation for employee 1 on 2026-06-01, deduction=50000, severity=Normal
     * @ExpectedResult: Saved violation with correct fields, notification sent
     */
    it('should create violation and send notification', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        first_name: 'John',
        last_name: 'Doe',
      });
      mockViolationRepo.create.mockReturnValue({
        employee: { employee_id: 1 },
        violation_date: '2026-06-01',
        violation_type: 'Late',
        description: 'Arrived 30 min late',
        deduction_amount: '50000',
        severity: ViolationSeverity.NORMAL,
        status: ViolationStatus.PENDING,
      });
      mockViolationRepo.save.mockResolvedValue({
        violation_id: 1,
        violation_date: '2026-06-01',
        violation_type: 'Late',
        deduction_amount: '50000',
        severity: ViolationSeverity.NORMAL,
        status: ViolationStatus.PENDING,
      });

      const result = await service.create({
        employee_id: 1,
        violation_date: '2026-06-01',
        violation_type: 'Late',
        description: 'Arrived 30 min late',
        deduction_amount: '50000',
        severity: ViolationSeverity.NORMAL,
      });

      expect(result.violation_type).toBe('Late');
      expect(result.severity).toBe(ViolationSeverity.NORMAL);
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });
  });

  // ==================== FIND ALL ====================
  describe('findAll', () => {
    /**
     * @TestID: TC_BE_VIOL_03
     * @Priority: P1
     * @Category: Positive
     * @Description: Find all violations should return records with stats (total, resolved)
     * @Steps:
     * 1. Arrange: violationRepo.find returns 3 records (1 resolved, 2 pending)
     * 2. Act: Call service.findAll()
     * 3. Assert: Returns { records: [...], stats: { total: 3, resolved: 1 } }
     * @TestData: 3 violations, 1 resolved
     * @ExpectedResult: Records array and correct stats
     */
    it('should return all violations with stats', async () => {
      mockViolationRepo.find.mockResolvedValue([
        { violation_id: 1, status: ViolationStatus.RESOLVED },
        { violation_id: 2, status: ViolationStatus.PENDING },
        { violation_id: 3, status: ViolationStatus.PENDING },
      ]);

      const result = await service.findAll();

      expect(result.records).toHaveLength(3);
      expect(result.stats).toEqual({ total: 3, resolved: 1 });
    });

    /**
     * @TestID: TC_BE_VIOL_04
     * @Priority: P2
     * @Category: Positive
     * @Description: Find all violations filtered by employeeId should return only that employee's records
     * @Steps:
     * 1. Arrange: violationRepo.find filtered by employee_id=1 returns 2 records
     * 2. Act: Call service.findAll(1)
     * 3. Assert: Returns only employee 1's violations
     * @TestData: employeeId=1
     * @ExpectedResult: Filtered array with correct stats
     */
    it('should filter violations by employee ID', async () => {
      mockViolationRepo.find.mockResolvedValue([
        { violation_id: 1, status: ViolationStatus.PENDING },
        { violation_id: 2, status: ViolationStatus.RESOLVED },
      ]);

      const result = await service.findAll(1);

      expect(result.records).toHaveLength(2);
      expect(result.stats.total).toBe(2);
    });
  });

  // ==================== FIND ONE ====================
  describe('findOne', () => {
    /**
     * @TestID: TC_BE_VIOL_05
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Find one non-existent violation should throw NotFoundException
     * @Steps:
     * 1. Arrange: violationRepo.findOne returns null
     * 2. Act: Call service.findOne(999)
     * 3. Assert: NotFoundException
     * @TestData: violation_id=999
     * @ExpectedResult: NotFoundException('Violation not found')
     */
    it('should throw NotFoundException when violation not found', async () => {
      mockViolationRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_VIOL_06
     * @Priority: P2
     * @Category: Positive
     * @Description: Find one violation with employee scope should return the violation
     * @Steps:
     * 1. Arrange: violationRepo.findOne returns violation
     * 2. Act: Call service.findOne(1, 2)
     * 3. Assert: Violation returned
     * @TestData: violation_id=1, scoped to employee_id=2
     * @ExpectedResult: Violation object
     */
    it('should return violation when found with employee scope', async () => {
      const violation = {
        violation_id: 1,
        violation_type: 'Late',
        employee: { employee_id: 2 },
      };
      mockViolationRepo.findOne.mockResolvedValue(violation);

      const result = await service.findOne(1, 2);

      expect(result).toEqual(violation);
    });
  });

  // ==================== UPDATE ====================
  describe('update', () => {
    /**
     * @TestID: TC_BE_VIOL_07
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Update non-existent violation should throw NotFoundException
     * @Steps:
     * 1. Arrange: findOne returns null
     * 2. Act: Call service.update(999, { status: ViolationStatus.RESOLVED })
     * 3. Assert: NotFoundException
     * @TestData: violation_id=999
     * @ExpectedResult: NotFoundException
     */
    it('should throw NotFoundException when violation not found for update', async () => {
      mockViolationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { status: ViolationStatus.RESOLVED } as any)
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_VIOL_08
     * @Priority: P1
     * @Category: Positive
     * @Description: Update violation status and severity should save changes and notify
     * @Steps:
     * 1. Arrange: Violation found with Pending/Normal, update to Resolved/High with deduction
     * 2. Act: Call service.update(1, { status: ViolationStatus.RESOLVED, severity: ViolationSeverity.HIGH, deduction_amount: '100000' })
     * 3. Assert: Changes saved, notification sent with change details
     * @TestData: status Pending->Resolved, severity Normal->High, deduction 0->100000
     * @ExpectedResult: Updated violation, notification sent
     */
    it('should update violation status, severity, and deduction', async () => {
      mockViolationRepo.findOne.mockResolvedValue({
        violation_id: 1,
        employee: { employee_id: 1, first_name: 'John', last_name: 'Doe' },
        violation_date: '2026-06-01',
        violation_type: 'Late',
        description: 'Late',
        deduction_amount: '0.00',
        severity: ViolationSeverity.NORMAL,
        status: ViolationStatus.PENDING,
      });
      mockViolationRepo.save.mockResolvedValue({
        violation_id: 1,
        employee: { employee_id: 1, first_name: 'John', last_name: 'Doe' },
        violation_date: '2026-06-01',
        violation_type: 'Late',
        deduction_amount: '100000',
        severity: ViolationSeverity.HIGH,
        status: ViolationStatus.RESOLVED,
      });

      const result = await service.update(1, {
        deduction_amount: '100000',
        status: ViolationStatus.RESOLVED,
        severity: ViolationSeverity.HIGH,
      } as any);

      expect(result.status).toBe(ViolationStatus.RESOLVED);
      expect(result.severity).toBe(ViolationSeverity.HIGH);
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });
  });

  // ==================== REMOVE ====================
  describe('remove', () => {
    /**
     * @TestID: TC_BE_VIOL_09
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Remove non-existent violation should throw NotFoundException
     * @Steps:
     * 1. Arrange: findOne returns null
     * 2. Act: Call service.remove(999)
     * 3. Assert: NotFoundException
     * @TestData: violation_id=999
     * @ExpectedResult: NotFoundException
     */
    it('should throw NotFoundException when violation not found for remove', async () => {
      mockViolationRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_VIOL_10
     * @Priority: P1
     * @Category: Positive
     * @Description: Remove existing violation should delete and return success message
     * @Steps:
     * 1. Arrange: Violation found
     * 2. Act: Call service.remove(1)
     * 3. Assert: Violation removed, returns success message
     * @TestData: violation_id=1
     * @ExpectedResult: { message: 'Violation deleted successfully' }
     */
    it('should delete violation and return success message', async () => {
      mockViolationRepo.findOne.mockResolvedValue({ violation_id: 1 });
      mockViolationRepo.remove.mockResolvedValue({});

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Violation deleted successfully' });
      expect(mockViolationRepo.remove).toHaveBeenCalled();
    });
  });

  // ==================== SYNC ATTENDANCE ====================
  describe('syncAttendance', () => {
    /**
     * @TestID: TC_BE_VIOL_11
     * @Priority: P2
     * @Category: Positive
     * @Description: Sync attendance should create violations for incomplete shifts and notify admins
     * @Steps:
     * 1. Arrange: timeKeepingRepo.find returns 1 incomplete shift (<8 hours), no existing violation
     * 2. Act: Call service.syncAttendance()
     * 3. Assert: Violation created, admin notifications sent
     * @TestData: 1 incomplete shift record
     * @ExpectedResult: { message: 'Sync complete', createdCount: 1 }
     */
    it('should create violations for incomplete shifts and notify admins', async () => {
      mockTimeKeepingRepo.find.mockResolvedValue([
        {
          hours_worked: 5,
          work_date: '2026-06-01',
          employee: { employee_id: 1 },
        },
      ]);
      mockViolationRepo.findOne.mockResolvedValue(null);
      mockViolationRepo.create.mockReturnValue({});
      mockViolationRepo.save.mockResolvedValue({});
      mockEmployeeRepo.find.mockResolvedValue([
        { employee_id: 1, position: { position_name: 'Admin' } },
        { employee_id: 2, position: { position_name: 'Director' } },
        { employee_id: 3, position: { position_name: 'Staff' } },
      ]);

      const result = await service.syncAttendance();

      expect(result.createdCount).toBe(1);
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_VIOL_12
     * @Priority: P2
     * @Category: Positive
     * @Description: Sync attendance should skip when no incomplete shifts found
     * @Steps:
     * 1. Arrange: timeKeepingRepo.find returns empty
     * 2. Act: Call service.syncAttendance()
     * 3. Assert: createdCount=0, no violation created
     * @TestData: No incomplete shifts
     * @ExpectedResult: { message: 'Sync complete', createdCount: 0 }
     */
    it('should return createdCount 0 when no incomplete shifts found', async () => {
      mockTimeKeepingRepo.find.mockResolvedValue([]);

      const result = await service.syncAttendance();

      expect(result.createdCount).toBe(0);
    });

    /**
     * @TestID: TC_BE_VIOL_13
     * @Priority: P3
     * @Category: Positive
     * @Description: Sync attendance should skip employees without references
     * @Steps:
     * 1. Arrange: timeKeepingRepo.find returns record with no employee relation
     * 2. Act: Call service.syncAttendance()
     * 3. Assert: No violation created, createdCount=0
     * @TestData: Record with null employee
     * @ExpectedResult: createdCount=0
     */
    it('should skip records with null employee reference', async () => {
      mockTimeKeepingRepo.find.mockResolvedValue([
        { hours_worked: 5, work_date: '2026-06-01', employee: null },
      ]);

      const result = await service.syncAttendance();

      expect(result.createdCount).toBe(0);
    });
  });
});
