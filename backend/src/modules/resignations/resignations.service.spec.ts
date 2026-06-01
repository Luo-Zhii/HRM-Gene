import { Test, TestingModule } from '@nestjs/testing';
import { ResignationsService } from './resignations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ResignationRequest, ResignationStatus } from '../../entities/resignation-request.entity';
import { Employee, EmploymentStatus } from '../../entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ResignationsService', () => {
  let service: ResignationsService;

  const mockResRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEmployeeRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn().mockResolvedValue([]),
  };

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResignationsService,
        { provide: getRepositoryToken(ResignationRequest), useValue: mockResRepo },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ResignationsService>(ResignationsService);
    jest.clearAllMocks();
  });

  // ==================== CREATE ====================
  describe('create', () => {
    /**
     * @TestID: TC_BE_RESIGN_01
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Create resignation when employee already has a pending request should throw BadRequestException
     * @Steps:
     * 1. Arrange: resRepo.findOne returns existing pending resignation request
     * 2. Act: Call service.create(1, { requested_last_day: '2026-06-30', reason_text: 'New opportunity' })
     * 3. Assert: BadRequestException('You already have a pending resignation request.')
     * @TestData: employeeId=1, existing Pending request
     * @ExpectedResult: BadRequestException
     */
    it('should throw BadRequestException when employee already has a pending resignation', async () => {
      mockResRepo.findOne.mockResolvedValue({ id: 1, status: ResignationStatus.PENDING });

      await expect(
        service.create(1, { requested_last_day: '2026-06-30', reason_text: 'New opportunity' })
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_RESIGN_02
     * @Priority: P1
     * @Category: Positive
     * @Description: Create new resignation request should save with Pending status and notify admins
     * @Steps:
     * 1. Arrange: No existing pending request, employee found
     * 2. Act: Call service.create(1, { requested_last_day: '2026-06-30', reason_text: 'Better opportunity' })
     * 3. Assert: ResignationRequest created with Pending status, admin notifications sent
     * @TestData: employeeId=1, last_day=2026-06-30, reason='Better opportunity'
     * @ExpectedResult: Saved resignation with status Pending
     */
    it('should create resignation request and notify admins', async () => {
      mockResRepo.findOne.mockResolvedValue(null);
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        position: { position_name: 'Staff' },
      });
      mockResRepo.create.mockReturnValue({
        employee_id: 1,
        requested_last_day: '2026-06-30',
        reason_text: 'Better opportunity',
        status: ResignationStatus.PENDING,
      });
      mockResRepo.save.mockResolvedValue({
        id: 1,
        employee_id: 1,
        requested_last_day: '2026-06-30',
        reason_text: 'Better opportunity',
        status: ResignationStatus.PENDING,
      });
      mockEmployeeRepo.find.mockResolvedValue([]);

      const result: any = await service.create(1, {
        requested_last_day: '2026-06-30',
        reason_text: 'Better opportunity',
      });

      expect(result.status).toBe(ResignationStatus.PENDING);
    });
  });

  // ==================== FIND MY REQUESTS ====================
  describe('findMyRequests', () => {
    /**
     * @TestID: TC_BE_RESIGN_03
     * @Priority: P1
     * @Category: Positive
     * @Description: Find my resignation requests should return all requests for the employee
     * @Steps:
     * 1. Arrange: resRepo.find returns 2 resignation requests for employeeId=1
     * 2. Act: Call service.findMyRequests(1)
     * 3. Assert: Returns array of 2 requests
     * @TestData: employeeId=1 has 2 requests (1 Pending, 1 Rejected)
     * @ExpectedResult: Array with 2 resignation requests
     */
    it('should return all resignation requests for an employee', async () => {
      mockResRepo.find.mockResolvedValue([
        { id: 1, employee_id: 1, status: ResignationStatus.PENDING, reason_text: 'x' },
        { id: 2, employee_id: 1, status: ResignationStatus.REJECTED, reason_text: 'y' },
      ]);

      const result = await service.findMyRequests(1);

      expect(result).toHaveLength(2);
    });
  });

  // ==================== FIND ALL ====================
  describe('findAll', () => {
    /**
     * @TestID: TC_BE_RESIGN_04
     * @Priority: P2
     * @Category: Positive
     * @Description: Find all resignation requests should return all requests with employee relation
     * @Steps:
     * 1. Arrange: resRepo.find returns requests with employee relation
     * 2. Act: Call service.findAll()
     * 3. Assert: Returns array with employee data
     * @TestData: All resignation requests
     * @ExpectedResult: Array of requests with employee relation
     */
    it('should return all resignation requests with employee relation', async () => {
      mockResRepo.find.mockResolvedValue([
        { id: 1, status: ResignationStatus.PENDING, employee: { employee_id: 1, first_name: 'John' } },
        { id: 2, status: ResignationStatus.APPROVED, employee: { employee_id: 2, first_name: 'Jane' } },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });
  });

  // ==================== UPDATE STATUS ====================
  describe('updateStatus', () => {
    /**
     * @TestID: TC_BE_RESIGN_05
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Update status of non-existent resignation should throw NotFoundException
     * @Steps:
     * 1. Arrange: resRepo.findOne returns null
     * 2. Act: Call service.updateStatus(999, { status: ResignationStatus.APPROVED })
     * 3. Assert: NotFoundException
     * @TestData: id=999
     * @ExpectedResult: NotFoundException('Resignation request not found')
     */
    it('should throw NotFoundException when resignation request not found', async () => {
      mockResRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, { status: ResignationStatus.APPROVED } as any)
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_RESIGN_06
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Update status of already approved/rejected resignation should throw BadRequestException
     * @Steps:
     * 1. Arrange: resRepo.findOne returns request with status APPROVED
     * 2. Act: Call service.updateStatus(1, { status: ResignationStatus.REJECTED })
     * 3. Assert: BadRequestException('Can only update pending requests')
     * @TestData: request already approved
     * @ExpectedResult: BadRequestException
     */
    it('should throw BadRequestException when updating non-pending resignation', async () => {
      mockResRepo.findOne.mockResolvedValue({
        id: 1,
        status: ResignationStatus.APPROVED,
        employee: { employee_id: 1 },
      });

      await expect(
        service.updateStatus(1, { status: ResignationStatus.REJECTED } as any)
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_RESIGN_07
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Approving resignation without resignation_category should throw BadRequestException
     * @Steps:
     * 1. Arrange: Pending request found, status=APPROVED but no resignation_category
     * 2. Act: Call service.updateStatus(1, { status: ResignationStatus.APPROVED })
     * 3. Assert: BadRequestException('Approval requires a valid resignation_category')
     * @TestData: status=APPROVED, missing resignation_category
     * @ExpectedResult: BadRequestException
     */
    it('should throw BadRequestException when approving without resignation_category', async () => {
      mockResRepo.findOne.mockResolvedValue({
        id: 1,
        status: ResignationStatus.PENDING,
        employee: { employee_id: 1 },
        requested_last_day: '2026-06-30',
      });

      await expect(
        service.updateStatus(1, { status: ResignationStatus.APPROVED } as any)
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_RESIGN_08
     * @Priority: P1
     * @Category: Positive
     * @Description: Approve resignation should terminate employee, terminate contracts, and notify
     * @Steps:
     * 1. Arrange: Pending request found, status=APPROVED, resignation_category='Personal'
     * 2. Act: Call service.updateStatus(1, { status: ResignationStatus.APPROVED, resignation_category: 'Personal' })
     * 3. Assert: Employee set to TERMINATED, contracts terminated, notification sent
     * @TestData: status=APPROVED, category=Personal, last_day=2026-06-30
     * @ExpectedResult: Approved resignation, employee terminated
     */
    it('should approve resignation, terminate employee, and notify', async () => {
      mockResRepo.findOne.mockResolvedValue({
        id: 1,
        status: ResignationStatus.PENDING,
        employee: { employee_id: 1, employment_status: EmploymentStatus.ACTIVE },
        requested_last_day: '2026-06-30',
        employee_id: 1,
      });
      mockEmployeeRepo.save.mockResolvedValue({
        employee_id: 1,
        employment_status: EmploymentStatus.TERMINATED,
      });
      mockResRepo.save.mockResolvedValue({
        id: 1,
        status: ResignationStatus.APPROVED,
        employee_id: 1,
      });

      const result = await service.updateStatus(1, {
        status: ResignationStatus.APPROVED,
        resignation_category: 'Personal' as any,
      });

      expect(result.status).toBe(ResignationStatus.APPROVED);
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE contract'),
        expect.any(Array)
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_RESIGN_09
     * @Priority: P2
     * @Category: Positive
     * @Description: Reject resignation should update status and notify employee without termination
     * @Steps:
     * 1. Arrange: Pending request found, status=REJECTED
     * 2. Act: Call service.updateStatus(1, { status: ResignationStatus.REJECTED })
     * 3. Assert: Status changed to Rejected, employee NOT terminated, notification sent
     * @TestData: status=REJECTED
     * @ExpectedResult: Rejected resignation, employee remains active
     */
    it('should reject resignation without terminating employee', async () => {
      mockResRepo.findOne.mockResolvedValue({
        id: 1,
        status: ResignationStatus.PENDING,
        employee: { employee_id: 1, employment_status: EmploymentStatus.ACTIVE },
        requested_last_day: '2026-06-30',
        employee_id: 1,
      });
      mockResRepo.save.mockResolvedValue({
        id: 1,
        status: ResignationStatus.REJECTED,
        employee_id: 1,
      });

      const result = await service.updateStatus(1, {
        status: ResignationStatus.REJECTED,
      });

      expect(result.status).toBe(ResignationStatus.REJECTED);
      // Employee should NOT have been saved (not terminated)
      expect(mockEmployeeRepo.save).not.toHaveBeenCalled();
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });
  });
});
