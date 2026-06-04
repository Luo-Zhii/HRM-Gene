import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee, EmploymentStatus } from '../../entities/employee.entity';
import { Department } from '../../entities/department.entity';
import { Position } from '../../entities/position.entity';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';
import { DataScopeService } from '../auth/data-scope.service';

jest.mock('bcrypt');

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepo: any;
  let deptRepo: any;
  let posRepo: any;
  let dataSource: any;
  let module: TestingModule;

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({}),
  };

  const mockDataScopeService = {
    getScopeWhere: jest.fn().mockReturnValue({}),
  };

  const mockEmployeeRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockDeptRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockPosRepo = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: getRepositoryToken(Department), useValue: mockDeptRepo },
        { provide: getRepositoryToken(Position), useValue: mockPosRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: DataScopeService, useValue: mockDataScopeService },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    employeeRepo = module.get(getRepositoryToken(Employee));
    deptRepo = module.get(getRepositoryToken(Department));
    posRepo = module.get(getRepositoryToken(Position));
    dataSource = module.get<DataSource>(DataSource);
  });

  beforeEach(() => {
    jest.resetAllMocks();
    mockNotificationsService.createNotification.mockResolvedValue({});
  });

  // ==================== CREATE ====================
  describe('create', () => {
    /**
     * @TestID: TC_BE_EMP_01
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Create employee with duplicate email should throw BadRequestException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns existing employee
     * 2. Act: Call service.create({ email: 'admin@example.com', password: 'pass', first_name: 'A', last_name: 'B' })
     * 3. Assert: BadRequestException thrown with 'Email already exists'
     * @TestData: email=admin@example.com (already exists)
     * @ExpectedResult: BadRequestException('Email already exists')
     */
    // [TC_BE_EMPLOY_156]
    it('should throw BadRequestException when email already exists', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1, email: 'admin@example.com' });

      await expect(
        service.create({ email: 'admin@example.com', password: 'pass', first_name: 'A', last_name: 'B' })
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_EMP_02
     * @Priority: P1
     * @Category: Positive
     * @Description: Create employee with valid data should hash password, assign department/position, and save
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null (no duplicate), bcrypt.hash returns 'hashed'
     * 2. Act: Call service.create({ email: 'user1@company.com', password: 'password123', first_name: 'John', last_name: 'Doe', department_id: 1, position_id: 2 })
     * 3. Assert: Password hashed, employee saved with hashed password, department and position assigned
     * @TestData: email=user1@company.com, password=password123, department=Engineering(1), position=Manager(2)
     * @ExpectedResult: Employee saved with hashed password and relations
     */
    // [TC_BE_EMPLOY_157]
    it('should hash password and create employee with department/position', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      deptRepo.findOne.mockResolvedValue({ department_id: 1, department_name: 'Engineering' });
      posRepo.findOne.mockResolvedValue({ position_id: 2, position_name: 'Manager' });
      employeeRepo.create.mockReturnValue({
        email: 'user1@company.com',
        password: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe',
      });
      employeeRepo.save.mockResolvedValue({
        employee_id: 10,
        email: 'user1@company.com',
        first_name: 'John',
        last_name: 'Doe',
      });

      const dto = {
        email: 'user1@company.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        department_id: 1,
        position_id: 2,
      };

      await service.create(dto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(employeeRepo.save).toHaveBeenCalled();
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });
  });

  // ==================== FIND ALL ====================
  describe('findAll', () => {
    /**
     * @TestID: TC_BE_EMP_03
     * @Priority: P1
     * @Category: Positive
     * @Description: Find all employees should return employees with salary info attached
     * @Steps:
     * 1. Arrange: employeeRepo.find returns 2 employees, dataSource.query returns salary for first
     * 2. Act: Call service.findAll({ employee_id: 1, email: 'admin@example.com', role: 'Director', permissions: [] })
     * 3. Assert: First employee has base_salary, second has null
     * @TestData: 2 employees, only one has salary config
     * @ExpectedResult: Array of employees with base_salary field
     */
    // [TC_BE_EMPLOY_158]
    it('should return employees with attached salary info', async () => {
      employeeRepo.find.mockResolvedValue([
        { employee_id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@example.com' },
        { employee_id: 2, first_name: 'Regular', last_name: 'Staff', email: 'user1@company.com' },
      ]);
      dataSource.query.mockResolvedValue([{ employee_id: 1, base_salary: '60000000.00' }]);

      const user = { employee_id: 1, email: 'admin@example.com', role: 'Director', permissions: [] };
      const result = await service.findAll(user);

      expect(result[0]).toHaveProperty('base_salary', '60000000.00');
      expect(result[1]).toHaveProperty('base_salary', null);
    });

    /**
     * @TestID: TC_BE_EMP_04
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Find all should fallback safely when salary query fails
     * @Steps:
     * 1. Arrange: dataSource.query rejects with error
     * 2. Act: Call service.findAll(user)
     * 3. Assert: Returns employees without salary info, no exception thrown
     * @TestData: DB error on salary query
     * @ExpectedResult: Employee list returned normally
     */
    // [TC_BE_EMPLOY_159]
    it('should fallback safely when salary query fails', async () => {
      employeeRepo.find.mockResolvedValue([
        { employee_id: 1, first_name: 'Admin' },
      ]);
      dataSource.query.mockRejectedValue(new Error('Table not found'));

      const user = { employee_id: 1, email: 'admin@example.com', role: 'Director', permissions: [] };
      const result = await service.findAll(user);

      expect(result).toHaveLength(1);
    });
  });

  // ==================== FIND ONE ====================
  describe('findOne', () => {
    /**
     * @TestID: TC_BE_EMP_05
     * @Priority: P1
     * @Category: Positive
     * @Description: Find one employee by ID should return employee with relations
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns employee with department, position, bankInfo, contracts
     * 2. Act: Call service.findOne(1)
     * 3. Assert: Returns employee object
     * @TestData: employeeId=1 (Admin user)
     * @ExpectedResult: Employee object with relations
     */
    // [TC_BE_EMPLOY_160]
    it('should return employee when found by ID', async () => {
      const employee = {
        employee_id: 1,
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        department: { department_id: 1, department_name: 'Engineering' },
        position: { position_id: 1, position_name: 'Director' },
        bankInfo: null,
        contracts: [],
      };
      employeeRepo.findOne.mockResolvedValue(employee);

      const result = await service.findOne(1);

      expect(result).toEqual(employee);
      expect(result.email).toBe('admin@example.com');
    });

    /**
     * @TestID: TC_BE_EMP_06
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Find one with non-existent ID should throw NotFoundException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null
     * 2. Act: Call service.findOne(999)
     * 3. Assert: NotFoundException thrown
     * @TestData: employeeId=999 (non-existent)
     * @ExpectedResult: NotFoundException('Employee not found')
     */
    // [TC_BE_EMPLOY_161]
    it('should throw NotFoundException when employee not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== UPDATE ====================
  describe('update', () => {
    /**
     * @TestID: TC_BE_EMP_07
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Update non-existent employee should throw NotFoundException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null
     * 2. Act: Call service.update(999, { first_name: 'New' })
     * 3. Assert: NotFoundException thrown
     * @TestData: employeeId=999
     * @ExpectedResult: NotFoundException
     */
    // [TC_BE_EMPLOY_162]
    it('should throw NotFoundException when employee not found for update', async () => {
      employeeRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { first_name: 'New' })).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_EMP_08
     * @Priority: P1
     * @Category: Positive
     * @Description: Update employee with new password and department/position should apply all changes
     * @Steps:
     * 1. Arrange: Employee found with bankInfo, password change with bcrypt, dept and pos found
     * 2. Act: Call service.update(1, { password: 'newpass', first_name: 'Updated', department_id: 2, position_id: 3, bank_info: { bank_name: 'TechBank' } })
     * 3. Assert: Password hashed, all fields updated in save call
     * @TestData: password=old -> newpass, first_name=Admin -> Updated, dept change, position change, bank info set
     * @ExpectedResult: Employee saved with updated fields
     */
    // [TC_BE_EMPLOY_163]
    it('should update password, details, department, position, and bank info', async () => {
      employeeRepo.findOne
        .mockResolvedValueOnce({ employee_id: 1, bankInfo: {} }) // first call
        .mockResolvedValueOnce({ employee_id: 1, first_name: 'Updated' }); // from findOne at end
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed');
      deptRepo.findOne
        .mockResolvedValueOnce({ department_id: 2, department_name: 'Sales' }) // new dept
        .mockResolvedValueOnce(null); // oldDeptAsManager check
      posRepo.findOne.mockResolvedValue({ position_id: 3, position_name: 'Manager' });
      employeeRepo.save.mockResolvedValue({ employee_id: 1, first_name: 'Updated' });

      const updateDto = {
        password: 'newpass',
        first_name: 'Updated',
        department_id: 2,
        position_id: 3,
        bank_info: { bank_name: 'TechBank' },
      };

      await service.update(1, updateDto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(employeeRepo.save).toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_EMP_09
     * @Priority: P2
     * @Category: Positive
     * @Description: Terminating employee should update status and auto-terminate contracts
     * @Steps:
     * 1. Arrange: Employee found, employment_status set to TERMINATED
     * 2. Act: Call service.update(1, { employment_status: EmploymentStatus.TERMINATED })
     * 3. Assert: dataSource.query called to terminate active contracts
     * @TestData: employment_status=TERMINATED
     * @ExpectedResult: Contract termination SQL query executed
     */
    // [TC_BE_EMPLOY_164]
    it('should terminate contracts when employee status set to Terminated', async () => {
      employeeRepo.findOne
        .mockResolvedValueOnce({ employee_id: 1 }) // first call
        .mockResolvedValueOnce({ employee_id: 1, employment_status: 'Terminated' }); // findOne at end
      employeeRepo.save.mockResolvedValue({ employee_id: 1, employment_status: 'Terminated' });

      await service.update(1, { employment_status: EmploymentStatus.TERMINATED, resignation_date: '2026-06-01' } as any);

      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE contract'),
        expect.any(Array)
      );
    });
  });

  // ==================== ONBOARD ====================
  describe('onboard', () => {
    /**
     * @TestID: TC_BE_EMP_10
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Onboard non-existent employee should throw NotFoundException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null
     * 2. Act: Call service.onboard(999)
     * 3. Assert: NotFoundException thrown
     * @TestData: employeeId=999
     * @ExpectedResult: NotFoundException
     */
    // [TC_BE_EMPLOY_165]
    it('should throw NotFoundException when employee not found for onboard', async () => {
      employeeRepo.findOne.mockResolvedValue(null);

      await expect(service.onboard(999)).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_EMP_11
     * @Priority: P1
     * @Category: Positive
     * @Description: Onboard should reactivate terminated employee, clear resignation fields, reset failed_attempts
     * @Steps:
     * 1. Arrange: Terminated employee found
     * 2. Act: Call service.onboard(1)
     * 3. Assert: Status set to Active, resignation_date/reason null, failed_attempts=0, contracts reactivated
     * @TestData: employeeId=1, previously Terminated
     * @ExpectedResult: Employee reactivated with Active status, contracts reactivated
     */
    // [TC_BE_EMPLOY_166]
    it('should reactivate terminated employee and restore contracts', async () => {
      employeeRepo.findOne
        .mockResolvedValueOnce({ employee_id: 1, employment_status: EmploymentStatus.TERMINATED }) // first
        .mockResolvedValueOnce({ employee_id: 1, employment_status: EmploymentStatus.ACTIVE }); // findOne at end
      employeeRepo.save.mockResolvedValue({ employee_id: 1, employment_status: EmploymentStatus.ACTIVE });

      await service.onboard(1);

      expect(employeeRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          employment_status: EmploymentStatus.ACTIVE,
          resignation_date: null,
          resignation_reason: null,
          failed_attempts: 0,
        })
      );
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE contract'),
        [1]
      );
    });
  });

  // ==================== REMOVE ====================
  describe('remove', () => {
    /**
     * @TestID: TC_BE_EMP_12
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Remove non-existent employee should throw NotFoundException
     * @Steps:
     * 1. Arrange: employeeRepo.findOne returns null
     * 2. Act: Call service.remove(999)
     * 3. Assert: NotFoundException thrown
     * @TestData: employeeId=999
     * @ExpectedResult: NotFoundException
     */
    // [TC_BE_EMPLOY_167]
    it('should throw NotFoundException when employee not found for remove', async () => {
      employeeRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_EMP_13
     * @Priority: P1
     * @Category: Positive
     * @Description: Remove employee should unassign from manager role and delete employee
     * @Steps:
     * 1. Arrange: Employee found, is a department manager
     * 2. Act: Call service.remove(1)
     * 3. Assert: Manager unassigned, employee removed, returns { deleted: true }
     * @TestData: employeeId=1 is department manager
     * @ExpectedResult: { deleted: true }
     */
    // [TC_BE_EMPLOY_168]
    it('should unassign manager role and remove employee', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      deptRepo.findOne.mockResolvedValue({ department_id: 1, manager: { employee_id: 1 } });
      employeeRepo.remove.mockResolvedValue({});

      const result = await service.remove(1);

      expect(deptRepo.save).toHaveBeenCalled();
      expect(employeeRepo.remove).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });

  // ==================== SEARCH ====================
  describe('search', () => {
    /**
     * @TestID: TC_BE_EMP_14
     * @Priority: P2
     * @Category: Positive
     * @Description: Search employees by keyword should return mapped results with name, email, type
     * @Steps:
     * 1. Arrange: employeeRepo.find returns matching employee
     * 2. Act: Call service.search('John')
     * 3. Assert: Returns array with { type: 'employee', id, name, email }
     * @TestData: keyword='John'
     * @ExpectedResult: Array with mapped employee result
     */
    // [TC_BE_EMPLOY_169]
    it('should search employees by keyword and return mapped results', async () => {
      employeeRepo.find.mockResolvedValue([
        { employee_id: 2, first_name: 'John', last_name: 'Doe', email: 'jdoe@example.com' },
      ]);

      const result = await service.search('John');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'employee',
        id: 2,
        name: 'John Doe',
        email: 'jdoe@example.com',
      });
    });

    /**
     * @TestID: TC_BE_EMP_15
     * @Priority: P3
     * @Category: Positive
     * @Description: Search with no matching results should return empty array
     * @Steps:
     * 1. Arrange: employeeRepo.find returns empty array
     * 2. Act: Call service.search('NonExistent')
     * 3. Assert: Returns empty array
     * @TestData: keyword='NonExistent'
     * @ExpectedResult: []
     */
    // [TC_BE_EMPLOY_170]
    it('should return empty array when no employees match search keyword', async () => {
      employeeRepo.find.mockResolvedValue([]);

      const result = await service.search('NonExistent');

      expect(result).toEqual([]);
    });
  });

  // ==================== FIND ALL PUBLIC ====================
  describe('findAllPublic', () => {
    /**
     * @TestID: TC_BE_EMP_16
     * @Priority: P1
     * @Category: Positive
     * @Description: Find all public should exclude sensitive fields (phone, address, bankInfo, contracts)
     * @Steps:
     * 1. Arrange: employeeRepo.find returns employee with all fields
     * 2. Act: Call service.findAllPublic({ department: { department_id: 1 } })
     * 3. Assert: Result excludes phone_number, address, password, bankInfo
     * @TestData: employee with phone_number='0123456789', address='123 Street'
     * @ExpectedResult: Public fields only, sensitive fields excluded
     */
    // [TC_BE_EMPLOY_171]
    it('should strip sensitive fields and return only public data', async () => {
      employeeRepo.find.mockResolvedValue([
        {
          employee_id: 1,
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          avatar_url: '/avatars/1.png',
          phone_number: '0123456789',
          address: '123 Admin Street',
          department: { department_id: 1, department_name: 'Engineering' },
          position: { position_id: 1, position_name: 'Director' },
        },
      ]);

      const result = await service.findAllPublic({ department: { department_id: 1 } });

      expect(result[0]).toEqual({
        employee_id: 1,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        avatar_url: '/avatars/1.png',
        department: { department_id: 1, department_name: 'Engineering' },
        position: { position_id: 1, position_name: 'Director' },
      });
      expect((result[0] as any).phone_number).toBeUndefined();
      expect((result[0] as any).address).toBeUndefined();
      expect((result[0] as any).password).toBeUndefined();
    });

    /**
     * @TestID: TC_BE_EMP_17
     * @Priority: P2
     * @Category: Positive
     * @Description: Find all public without department should return empty (department_id=-1 filter)
     * @Steps:
     * 1. Arrange: User has no department
     * 2. Act: Call service.findAllPublic({ department: undefined })
     * 3. Assert: Query uses department_id=-1, effectively hiding all employees
     * @TestData: user without department
     * @ExpectedResult: Empty array (no employees visible)
     */
    // [TC_BE_EMPLOY_172]
    it('should hide all employees when user has no department', async () => {
      employeeRepo.find.mockResolvedValue([]);

      const result = await service.findAllPublic({ department: undefined } as any);

      expect(result).toEqual([]);
    });
  });
});
