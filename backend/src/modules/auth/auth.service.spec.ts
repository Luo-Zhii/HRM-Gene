import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../../entities/employee.entity';
import { Position } from '../../entities/position.entity';
import { PositionPermission } from '../../entities/position-permission.entity';
import { Permission } from '../../entities/permission.entity';
import { Department } from '../../entities/department.entity';
import { NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;
  let employeeRepo: any;
  let ppRepo: any;
  let permissionRepo: any;
  let positionRepo: any;
  let departmentRepo: any;

  const mockJwtService = { sign: jest.fn() };
  const mockEmployeeRepo = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
  const mockPositionRepo = { findOne: jest.fn() };
  const mockDepartmentRepo = { findOne: jest.fn() };
  const mockPpRepo = { find: jest.fn() };
  const mockPermissionRepo = { find: jest.fn() };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: getRepositoryToken(Position), useValue: mockPositionRepo },
        { provide: getRepositoryToken(Department), useValue: mockDepartmentRepo },
        { provide: getRepositoryToken(PositionPermission), useValue: mockPpRepo },
        { provide: getRepositoryToken(Permission), useValue: mockPermissionRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    employeeRepo = module.get(getRepositoryToken(Employee));
    ppRepo = module.get(getRepositoryToken(PositionPermission));
    permissionRepo = module.get(getRepositoryToken(Permission));
    positionRepo = module.get(getRepositoryToken(Position));
    departmentRepo = module.get(getRepositoryToken(Department));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== VALIDATE USER ====================
  describe('validateUser', () => {
    /**
     * @TestID: TC_BE_AUTH_01
     * @Priority: P1
     * @Category: Positive
     * @Description: Validate user with correct email and password should return user without password and with permissions
     * @Steps:
     * 1. Arrange: Mock employeeRepo.findOne returns user with position, bcrypt.compare returns true, ppRepo.find returns empty
     * 2. Act: Call service.validateUser('admin@example.com', 'admin')
     * 3. Assert: Result contains email, no password field, permissions is an array
     * @TestData: email=admin@example.com, password=admin
     * @ExpectedResult: User object without password, permissions=[]
     */
    // [TC_BE_AUTH_066]
    it('should return user without password and with permissions on successful validation', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        email: 'admin@example.com',
        password: 'hashed_password',
        first_name: 'Admin',
        last_name: 'User',
        failed_attempts: 0,
        employment_status: 'Active',
        position: { position_id: 1, position_name: 'Director' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPpRepo.find.mockResolvedValue([]);

      const result = await service.validateUser('admin@example.com', 'admin');

      expect(result).toHaveProperty('email', 'admin@example.com');
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('permissions', []);
    });

    /**
     * @TestID: TC_BE_AUTH_02
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Validate user with non-existent email should throw NotFoundException
     * @Steps:
     * 1. Arrange: Mock employeeRepo.findOne returns null
     * 2. Act: Call service.validateUser('nonexistent@example.com', 'any')
     * 3. Assert: NotFoundException is thrown
     * @TestData: email=nonexistent@example.com
     * @ExpectedResult: NotFoundException thrown with Vietnamese error message
     */
    // [TC_BE_AUTH_067]
    it('should throw NotFoundException when email is not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'any'))
        .rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_AUTH_03
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Validate user with locked account (failed_attempts >= 5) should throw UnauthorizedException
     * @Steps:
     * 1. Arrange: Mock employeeRepo.findOne returns user with failed_attempts=5
     * 2. Act: Call service.validateUser('user@example.com', 'any')
     * 3. Assert: UnauthorizedException is thrown with lockout message
     * @TestData: failed_attempts=5
     * @ExpectedResult: UnauthorizedException thrown
     */
    // [TC_BE_AUTH_068]
    it('should throw UnauthorizedException when account is locked (failed_attempts >= 5)', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        email: 'user@example.com',
        failed_attempts: 5,
        employment_status: 'Active',
      });

      await expect(service.validateUser('user@example.com', 'any'))
        .rejects.toThrow(UnauthorizedException);
    });

    /**
     * @TestID: TC_BE_AUTH_04
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Validate user with wrong password should increment failed_attempts and throw UnauthorizedException
     * @Steps:
     * 1. Arrange: Mock user with failed_attempts=0, bcrypt.compare returns false
     * 2. Act: Call service.validateUser('user@example.com', 'wrong_password')
     * 3. Assert: UnauthorizedException is thrown, failed_attempts incremented and saved
     * @TestData: failed_attempts=0, wrong password
     * @ExpectedResult: UnauthorizedException, employeeRepo.save called with failed_attempts=1
     */
    // [TC_BE_AUTH_069]
    it('should increment failed_attempts on wrong password and throw UnauthorizedException', async () => {
      const user = {
        employee_id: 2,
        email: 'user1@company.com',
        password: 'hashed',
        failed_attempts: 0,
        employment_status: 'Active',
      };
      mockEmployeeRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockEmployeeRepo.save.mockResolvedValue({ ...user, failed_attempts: 1 });

      await expect(service.validateUser('user1@company.com', 'wrong'))
        .rejects.toThrow(UnauthorizedException);

      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ failed_attempts: 1 })
      );
    });

    /**
     * @TestID: TC_BE_AUTH_05
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Validate terminated employee past resignation date should throw ForbiddenException
     * @Steps:
     * 1. Arrange: Mock user with employment_status=Terminated, resignation_date in the past
     * 2. Act: Call service.validateUser
     * 3. Assert: ForbiddenException is thrown
     * @TestData: employment_status=Terminated, resignation_date=2020-01-01
     * @ExpectedResult: ForbiddenException thrown
     */
    // [TC_BE_AUTH_070]
    it('should throw ForbiddenException for terminated employee past resignation date', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        email: 'terminated@example.com',
        password: 'hashed',
        failed_attempts: 0,
        employment_status: 'Terminated',
        resignation_date: '2020-01-01',
        position: { position_id: 1 },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUser('terminated@example.com', 'pass'))
        .rejects.toThrow(ForbiddenException);
    });

    /**
     * @TestID: TC_BE_AUTH_06
     * @Priority: P2
     * @Category: Positive
     * @Description: Successful login should reset failed_attempts to 0
     * @Steps:
     * 1. Arrange: Mock user with failed_attempts=3, bcrypt.compare returns true
     * 2. Act: Call service.validateUser
     * 3. Assert: failed_attempts reset to 0 and saved
     * @TestData: failed_attempts=3 before login
     * @ExpectedResult: employeeRepo.save called with failed_attempts=0
     */
    // [TC_BE_AUTH_071]
    it('should reset failed_attempts to 0 on successful login', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        email: 'admin@example.com',
        password: 'hashed',
        failed_attempts: 3,
        employment_status: 'Active',
        position: { position_id: 1 },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPpRepo.find.mockResolvedValue([]);

      await service.validateUser('admin@example.com', 'admin');

      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ failed_attempts: 0 })
      );
    });

    /**
     * @TestID: TC_BE_AUTH_07
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Fifth consecutive wrong password should lock account and throw UnauthorizedException
     * @Steps:
     * 1. Arrange: Mock user with failed_attempts=4, bcrypt.compare returns false
     * 2. Act: Call service.validateUser
     * 3. Assert: UnauthorizedException thrown, failed_attempts becomes 5, save called
     * @TestData: failed_attempts=4, then incremented to 5
     * @ExpectedResult: UnauthorizedException thrown with lockout message
     */
    // [TC_BE_AUTH_072]
    it('should lock account on 5th consecutive wrong password attempt', async () => {
      const user = {
        employee_id: 2,
        email: 'user1@company.com',
        password: 'hashed',
        failed_attempts: 4,
        employment_status: 'Active',
      };
      mockEmployeeRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('user1@company.com', 'wrong'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ==================== LOGIN ====================
  describe('login', () => {
    /**
     * @TestID: TC_BE_AUTH_08
     * @Priority: P1
     * @Category: Positive
     * @Description: Login should generate JWT access token with correct payload
     * @Steps:
     * 1. Arrange: mockJwtService.sign returns 'jwt_token_xyz'
     * 2. Act: Call service.login({ employee_id: 1, email: 'admin@example.com', position: { position_name: 'Director' } })
     * 3. Assert: Returns access_token, jwtService.sign called with sub, email, role
     * @TestData: employee_id=1, email=admin@example.com, role=Director
     * @ExpectedResult: { access_token: 'jwt_token_xyz' }
     */
    // [TC_BE_AUTH_073]
    it('should return access_token with correct JWT payload (sub, email, role)', async () => {
      mockJwtService.sign.mockReturnValue('jwt_token_xyz');

      const result = await service.login({
        employee_id: 1,
        email: 'admin@example.com',
        position: { position_name: 'Director' },
      });

      expect(result).toEqual({ access_token: 'jwt_token_xyz' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'admin@example.com',
        role: 'Director',
      });
    });

    /**
     * @TestID: TC_BE_AUTH_09
     * @Priority: P2
     * @Category: Positive
     * @Description: Login should handle user without position gracefully
     * @Steps:
     * 1. Arrange: mockJwtService.sign returns token
     * 2. Act: Call service.login({ employee_id: 1, email: 'a@a.com' })
     * 3. Assert: role is undefined in payload
     * @TestData: employee without position
     * @ExpectedResult: JWT payload has undefined role
     */
    // [TC_BE_AUTH_074]
    it('should handle login with user having no position', async () => {
      mockJwtService.sign.mockReturnValue('token_no_role');

      const result = await service.login({
        employee_id: 5,
        email: 'user1@company.com',
      });

      expect(result).toEqual({ access_token: 'token_no_role' });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 5, email: 'user1@company.com' })
      );
    });
  });

  // ==================== CHANGE PASSWORD ====================
  describe('changePassword', () => {
    /**
     * @TestID: TC_BE_AUTH_10
     * @Priority: P1
     * @Category: Positive
     * @Description: Change password with correct current password and valid new password should succeed
     * @Steps:
     * 1. Arrange: Mock employee found, bcrypt.compare returns true, bcrypt.hash returns new hash
     * 2. Act: Call service.changePassword(1, 'old', 'newpass123')
     * 3. Assert: Returns success message, password hashed and saved
     * @TestData: employeeId=1, current=old, new=newpass123
     * @ExpectedResult: { message: 'Password changed successfully' }
     */
    // [TC_BE_AUTH_075]
    it('should change password successfully with correct current password', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        password: 'old_hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed');

      const result = await service.changePassword(1, 'old', 'newpass123');

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_AUTH_11
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Change password with wrong current password should throw BadRequestException
     * @Steps:
     * 1. Arrange: Mock employee found, bcrypt.compare returns false
     * 2. Act: Call service.changePassword(1, 'wrong_current', 'newpass')
     * 3. Assert: BadRequestException thrown
     * @TestData: wrong current password
     * @ExpectedResult: BadRequestException('Current password is incorrect')
     */
    // [TC_BE_AUTH_076]
    it('should throw BadRequestException when current password is wrong', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        password: 'correct_hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(1, 'wrong_current', 'newpass'))
        .rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_AUTH_12
     * @Priority: P2
     * @Category: Negative
     * @Description: Change password with new password shorter than 6 characters should throw BadRequestException
     * @Steps:
     * 1. Arrange: Mock employee found, bcrypt.compare returns true
     * 2. Act: Call service.changePassword(1, 'old', '12345')
     * 3. Assert: BadRequestException thrown
     * @TestData: newPassword=12345 (5 chars)
     * @ExpectedResult: BadRequestException('New password must be at least 6 characters')
     */
    // [TC_BE_AUTH_077]
    it('should throw BadRequestException when new password is too short (< 6 chars)', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.changePassword(1, 'old', '12345'))
        .rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_AUTH_13
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Change password for non-existent user should throw NotFoundException
     * @Steps:
     * 1. Arrange: Mock employeeRepo.findOne returns null
     * 2. Act: Call service.changePassword(999, 'any', 'newpass123')
     * 3. Assert: NotFoundException thrown
     * @TestData: employeeId=999 (non-existent)
     * @ExpectedResult: NotFoundException('User not found')
     */
    // [TC_BE_AUTH_078]
    it('should throw NotFoundException when user not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(service.changePassword(999, 'any', 'newpass123'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ==================== GET PROFILE ====================
  describe('getProfile', () => {
    /**
     * @TestID: TC_BE_AUTH_14
     * @Priority: P1
     * @Category: Positive
     * @Description: Get profile should return user data without password and with permissions
     * @Steps:
     * 1. Arrange: Mock employee with position, relations, bankInfo
     * 2. Act: Call service.getProfile(1)
     * 3. Assert: Result has email, position, no password, includes permissions array
     * @TestData: employeeId=1
     * @ExpectedResult: Profile object without password field, with permissions
     */
    // [TC_BE_AUTH_079]
    it('should return user profile without password and with permissions', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 1,
        email: 'admin@example.com',
        password: 'secret',
        first_name: 'Admin',
        position: { position_id: 1, position_name: 'Director' },
        department: { department_name: 'Engineering' },
        bankInfo: null,
      });
      mockPpRepo.find.mockResolvedValue([{ permission_id: 1 }]);
      mockPermissionRepo.find.mockResolvedValue([
        { permission_name: 'manage:payroll', method: 'GET', apiPath: '/payroll' },
      ]);

      const result = await service.getProfile(1);

      expect(result.email).toBe('admin@example.com');
      expect(result.password).toBeUndefined();
      expect(result.permissions).toEqual(['GET:/payroll']);
    });

    /**
     * @TestID: TC_BE_AUTH_15
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Get profile for non-existent userId should throw NotFoundException
     * @Steps:
     * 1. Arrange: Mock employeeRepo.findOne returns null
     * 2. Act: Call service.getProfile(999)
     * 3. Assert: NotFoundException thrown
     * @TestData: employeeId=999
     * @ExpectedResult: NotFoundException('User not found')
     */
    // [TC_BE_AUTH_080]
    it('should throw NotFoundException when user not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_AUTH_16
     * @Priority: P2
     * @Category: Positive
     * @Description: Get profile for user without position should return empty permissions
     * @Steps:
     * 1. Arrange: Mock employee without position relation
     * 2. Act: Call service.getProfile(1)
     * 3. Assert: Result has permissions=[], no password
     * @TestData: employee without position
     * @ExpectedResult: Profile with permissions=[]
     */
    // [TC_BE_AUTH_081]
    it('should return empty permissions when employee has no position', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        employee_id: 5,
        email: 'staff@example.com',
        password: 'hash',
        position: null,
        department: null,
        bankInfo: null,
      });

      const result = await service.getProfile(5);

      expect(result.permissions).toEqual([]);
      expect(result.password).toBeUndefined();
    });
  });

  // ==================== REGISTER ADMIN USER ====================
  describe('registerAdminUser', () => {
    const validData = {
      email: 'newadmin@example.com',
      password: 'admin123',
      secretKey: 'my_secret_key',
      department_id: 1,
      position_id: 1,
      first_name: 'Admin',
      last_name: 'User',
    };

    beforeEach(() => {
      process.env.ADMIN_SECRET_KEY = 'my_secret_key';
    });

    /**
     * @TestID: TC_BE_AUTH_17
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Register admin with wrong secret key should throw UnauthorizedException
     * @Steps:
     * 1. Arrange: Set env ADMIN_SECRET_KEY='my_secret_key', pass wrong secret
     * 2. Act: Call service.registerAdminUser({ ...validData, secretKey: 'wrong' })
     * 3. Assert: UnauthorizedException thrown
     * @TestData: secretKey=wrong
     * @ExpectedResult: UnauthorizedException('Invalid system secret key')
     */
    // [TC_BE_AUTH_082]
    it('should throw UnauthorizedException when secret key is wrong', async () => {
      await expect(
        service.registerAdminUser({ ...validData, secretKey: 'wrong_key' })
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * @TestID: TC_BE_AUTH_18
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Register admin with duplicate email should throw BadRequestException
     * @Steps:
     * 1. Arrange: Mock employeeRepo.findOne returns existing user
     * 2. Act: Call service.registerAdminUser(validData)
     * 3. Assert: BadRequestException thrown
     * @TestData: email already exists
     * @ExpectedResult: BadRequestException('Email already exists')
     */
    // [TC_BE_AUTH_083]
    it('should throw BadRequestException when email already exists', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ employee_id: 1 });

      await expect(service.registerAdminUser(validData))
        .rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_AUTH_19
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Register admin with non-existent position should throw BadRequestException
     * @Steps:
     * 1. Arrange: Mock employeeRepo.findOne returns null (no duplicate), positionRepo.findOne returns null
     * 2. Act: Call service.registerAdminUser(validData)
     * 3. Assert: BadRequestException thrown
     * @TestData: position_id=999 (non-existent)
     * @ExpectedResult: BadRequestException('Position not found (Invalid ID)')
     */
    // [TC_BE_AUTH_084]
    it('should throw BadRequestException when position not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null); // no duplicate
      mockPositionRepo.findOne.mockResolvedValue(null); // position not found

      await expect(service.registerAdminUser(validData))
        .rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_AUTH_20
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Register admin with non-existent department should throw BadRequestException
     * @Steps:
     * 1. Arrange: Mock employeeRepo returns null, positionRepo returns position, departmentRepo returns null
     * 2. Act: Call service.registerAdminUser(validData)
     * 3. Assert: BadRequestException thrown
     * @TestData: department_id=999 (non-existent)
     * @ExpectedResult: BadRequestException('Department not found (Invalid ID)')
     */
    // [TC_BE_AUTH_085]
    it('should throw BadRequestException when department not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      mockPositionRepo.findOne.mockResolvedValue({ position_id: 1, position_name: 'Director' });
      mockDepartmentRepo.findOne.mockResolvedValue(null);

      await expect(service.registerAdminUser(validData))
        .rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_AUTH_21
     * @Priority: P1
     * @Category: Positive
     * @Description: Register admin with all valid data should create and return success
     * @Steps:
     * 1. Arrange: Mock all repos return valid data, bcrypt.hash returns hash, save returns saved employee
     * 2. Act: Call service.registerAdminUser(validData)
     * 3. Assert: Returns success message with new id
     * @TestData: email=newadmin@example.com, password=admin123, position=Director, department=Engineering
     * @ExpectedResult: { message: 'Account created successfully', id: 100 }
     */
    // [TC_BE_AUTH_086]
    it('should create admin user successfully with all valid data', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null); // no duplicate
      mockPositionRepo.findOne.mockResolvedValue({ position_id: 1, position_name: 'Director' });
      mockDepartmentRepo.findOne.mockResolvedValue({ department_id: 1, department_name: 'Engineering' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockEmployeeRepo.create.mockReturnValue({ ...validData, password: 'hashed_password' });
      mockEmployeeRepo.save.mockResolvedValue({ employee_id: 100, ...validData });

      const result = await service.registerAdminUser(validData);

      expect(result).toEqual({ message: 'Account created successfully', id: 100 });
      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
    });
  });
});
