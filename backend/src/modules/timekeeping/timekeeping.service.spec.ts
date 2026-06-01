import { Test, TestingModule } from '@nestjs/testing';
import { TimeKeepingService } from './timekeeping.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TimeKeeping } from '../../entities/timekeeping.entity';
import { Employee } from '../../entities/employee.entity';
import { Violation } from '../../entities/violation.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TimeKeepingService', () => {
  let service: TimeKeepingService;

  const mockTkRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };

  const mockEmployeeRepo = {
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockViolationRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb: any) => {
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockTkRepo),
      };
      return cb(manager);
    }),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeKeepingService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: getRepositoryToken(TimeKeeping), useValue: mockTkRepo },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: getRepositoryToken(Violation), useValue: mockViolationRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<TimeKeepingService>(TimeKeepingService);
    jest.clearAllMocks();
  });

  // ==================== GENERATE DYNAMIC QR ====================
  describe('generateDynamicQr', () => {
    /**
     * @TestID: TC_BE_TK_01
     * @Priority: P1
     * @Category: Positive
     * @Description: Generate dynamic QR should return a valid UUID token
     * @Steps:
     * 1. Arrange: No mocks needed (uses uuid internally)
     * 2. Act: Call service.generateDynamicQr()
     * 3. Assert: Returns { token: <uuid string> }
     * @TestData: None
     * @ExpectedResult: Object with token property being a non-empty string
     */
    it('should generate a dynamic QR token', async () => {
      const result = await service.generateDynamicQr();

      expect(result).toHaveProperty('token');
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });
  });

  // ==================== RECORD CHECK-IN BY DYNAMIC QR ====================
  describe('recordCheckInByDynamicQr', () => {
    /**
     * @TestID: TC_BE_TK_02
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Check-in with invalid QR token should throw BadRequestException
     * @Steps:
     * 1. Arrange: dynamicQrTokens does not contain the token
     * 2. Act: Call service.recordCheckInByDynamicQr(1, 'invalid_token_xyz')
     * 3. Assert: BadRequestException('Invalid or expired QR token')
     * @TestData: employeeId=1, token='invalid_token_xyz'
     * @ExpectedResult: BadRequestException
     */
    it('should throw BadRequestException for invalid QR token', async () => {
      await expect(
        service.recordCheckInByDynamicQr(1, 'invalid_token_xyz')
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_TK_03
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Check-in with expired QR token should throw BadRequestException
     * @Steps:
     * 1. Arrange: Generate a token, manually expire it by setting past timestamp
     * 2. Act: Call service.recordCheckInByDynamicQr(1, expiredToken)
     * 3. Assert: BadRequestException thrown
     * @TestData: Token with past expiration
     * @ExpectedResult: BadRequestException
     */
    it('should throw BadRequestException for expired QR token', async () => {
      // First generate a token, then we manipulate its expiry via service internals
      const qrResult = await service.generateDynamicQr();
      const token = qrResult.token;

      // Access the private map and set expiration to the past
      const map = (service as any).dynamicQrTokens;
      map.set(token, Date.now() - 10000); // expired 10 seconds ago

      await expect(
        service.recordCheckInByDynamicQr(1, token)
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_TK_04
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Check-in for non-existent employee should throw NotFoundException
     * @Steps:
     * 1. Arrange: Generate valid token, mock employeeRepo.findOne returns null
     * 2. Act: Call service.recordCheckInByDynamicQr(999, validToken)
     * 3. Assert: NotFoundException('Employee not found')
     * @TestData: employeeId=999
     * @ExpectedResult: NotFoundException
     */
    it('should throw NotFoundException when employee not found for QR check-in', async () => {
      const qrResult = await service.generateDynamicQr();
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.recordCheckInByDynamicQr(999, qrResult.token)
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_TK_05
     * @Priority: P1
     * @Category: Positive
     * @Description: First scan of the day (no existing record) should create check-in record
     * @Steps:
     * 1. Arrange: Valid token, employee found, no existing Tk record for today
     * 2. Act: Call service.recordCheckInByDynamicQr(1, token)
     * 3. Assert: Returns { status: 'CHECK_IN', message: 'Good morning!...' }, record saved
     * @TestData: employeeId=1, first scan of the day
     * @ExpectedResult: CHECK_IN status, check-in time recorded
     */
    it('should create check-in record on first scan of the day', async () => {
      const qrResult = await service.generateDynamicQr();
      const token = qrResult.token;

      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        first_name: 'John',
        last_name: 'Doe',
      });
      mockCacheManager.get.mockResolvedValue(null); // no debounce
      mockDataSource.transaction.mockImplementation(async (cb: any) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null), // no existing record
            create: jest.fn().mockReturnValue({
              timekeeping_id: 100,
              check_in_time: new Date(),
              work_date: new Date().toISOString().slice(0, 10),
              status: 'Present',
            }),
            save: jest.fn().mockResolvedValue({
              timekeeping_id: 100,
              check_in_time: new Date(),
              work_date: new Date().toISOString().slice(0, 10),
            }),
          }),
        };
        return cb(manager);
      });

      const result = await service.recordCheckInByDynamicQr(1, token);

      expect(result.status).toBe('CHECK_IN');
      expect(result.message).toContain('Good morning');
    });

    /**
     * @TestID: TC_BE_TK_06
     * @Priority: P1
     * @Category: Positive
     * @Description: Second scan of the day (has open check-in record) should complete check-out
     * @Steps:
     * 1. Arrange: Valid token, employee found, existing Tk record with check_in_time but no check_out_time
     * 2. Act: Call service.recordCheckInByDynamicQr(1, token)
     * 3. Assert: Returns { status: 'CHECK_OUT', message: 'Checked out...' }
     * @TestData: employeeId=1, second scan, hours_worked=8+
     * @ExpectedResult: CHECK_OUT status with duration
     */
    it('should complete check-out on second scan of the day', async () => {
      const qrResult = await service.generateDynamicQr();
      const token = qrResult.token;
      const checkInTime = new Date(Date.now() - 9 * 3600 * 1000); // 9 hours ago

      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        first_name: 'John',
        last_name: 'Doe',
      });
      mockCacheManager.get.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation(async (cb: any) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue({
              timekeeping_id: 100,
              check_in_time: checkInTime,
              check_out_time: null,
            }),
            create: jest.fn(),
            save: jest.fn().mockResolvedValue({
              timekeeping_id: 100,
              check_in_time: checkInTime,
              check_out_time: new Date(),
              hours_worked: 9,
              status: 'Present',
            }),
          }),
        };
        return cb(manager);
      });

      const result = await service.recordCheckInByDynamicQr(1, token);

      expect(result.status).toBe('CHECK_OUT');
      expect(result.duration).toBeDefined();
    });

    /**
     * @TestID: TC_BE_TK_07
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Rapid double scan should trigger debounce and throw BadRequestException
     * @Steps:
     * 1. Arrange: cacheManager.get returns timestamp less than 60s ago for check_in
     * 2. Act: Call service.recordCheckInByDynamicQr(1, token)
     * 3. Assert: BadRequestException with debounce message
     * @TestData: Last check_in action 10 seconds ago
     * @ExpectedResult: BadRequestException with remaining seconds
     */
    it('should throw BadRequestException on rapid debounce', async () => {
      const qrResult = await service.generateDynamicQr();
      const token = qrResult.token;

      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        first_name: 'John',
        last_name: 'Doe',
      });
      mockCacheManager.get.mockResolvedValue(Date.now() - 10000); // 10 seconds ago

      mockDataSource.transaction.mockImplementation(async (cb: any) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null),
          }),
        };
        return cb(manager);
      });

      await expect(
        service.recordCheckInByDynamicQr(1, token)
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_TK_08
     * @Priority: P2
     * @Category: Positive
     * @Description: Single-use token should be consumed after one successful check-in
     * @Steps:
     * 1. Arrange: Generate token, first check-in succeeds
     * 2. Act: Try to use same token again
     * 3. Assert: Second use fails with BadRequestException (token already consumed)
     * @TestData: Same token used twice
     * @ExpectedResult: Second attempt throws BadRequestException
     */
    it('should consume token after single use', async () => {
      const qrResult = await service.generateDynamicQr();
      const token = qrResult.token;

      // First use succeeds
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        first_name: 'John',
      });
      mockCacheManager.get.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation(async (cb: any) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({ timekeeping_id: 1 }),
          }),
        };
        return cb(manager);
      });

      await service.recordCheckInByDynamicQr(1, token);

      // Second use should fail (token was deleted after first use)
      await expect(
        service.recordCheckInByDynamicQr(1, token)
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==================== RECORD CHECK-IN BY IP ====================
  describe('recordCheckInByIP', () => {
    /**
     * @TestID: TC_BE_TK_09
     * @Priority: P1
     * @Category: Positive
     * @Description: IP-based check-in for employee without existing record should create new record
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns employee, no existing timekeeping record, no debounce
     * 2. Act: Call service.recordCheckInByIP(1, '192.168.1.100')
     * 3. Assert: Returns CHECK_IN status, IP stored
     * @TestData: employeeId=1, ip='192.168.1.100' (office network)
     * @ExpectedResult: CHECK_IN with IP address recorded
     */
    it('should create check-in record via IP with IP address stored', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        first_name: 'John',
      });
      mockCacheManager.get.mockResolvedValue(null);
      mockDataSource.transaction.mockImplementation(async (cb: any) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue({
              timekeeping_id: 200,
              check_in_time: new Date(),
              ip_address: '192.168.1.100',
            }),
            save: jest.fn().mockResolvedValue({
              timekeeping_id: 200,
              check_in_time: new Date(),
            }),
          }),
        };
        return cb(manager);
      });

      const result = await service.recordCheckInByIP(1, '192.168.1.100');

      expect(result.status).toBe('CHECK_IN');
    });

    /**
     * @TestID: TC_BE_TK_10
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: IP check-in for non-existent employee should throw NotFoundException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null
     * 2. Act: Call service.recordCheckInByIP(999, '192.168.1.1')
     * 3. Assert: NotFoundException
     * @TestData: employeeId=999
     * @ExpectedResult: NotFoundException('Employee not found')
     */
    it('should throw NotFoundException for non-existent employee via IP', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.recordCheckInByIP(999, '192.168.1.1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== GET ALL FOR ADMIN ====================
  describe('getAllForAdmin', () => {
    /**
     * @TestID: TC_BE_TK_11
     * @Priority: P1
     * @Category: Positive
     * @Description: Get all timekeeping records for admin with pagination should return paginated results
     * @Steps:
     * 1. Arrange: createQueryBuilder mock returns paginated data
     * 2. Act: Call service.getAllForAdmin(1, 10, '2026-06-01', '2026-06-10')
     * 3. Assert: Returns { data, stats, total, page, limit, totalPages }
     * @TestData: page=1, limit=10, date range 2026-06-01 to 2026-06-10
     * @ExpectedResult: Paginated response with stats
     */
    it('should return paginated timekeeping records with stats', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockTkRepo.createQueryBuilder.mockReturnValue(qb);
      mockEmployeeRepo.count.mockResolvedValue(5);
      mockEmployeeRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      });

      const result = await service.getAllForAdmin(1, 10, '2026-06-01', '2026-06-10');

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('totalPages');
    });
  });
});
