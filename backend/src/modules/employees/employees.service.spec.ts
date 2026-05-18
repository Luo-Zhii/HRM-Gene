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

jest.mock('bcrypt');

describe('EmployeesService', () => {
  let service: EmployeesService;

  const repoMockFactory = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  let employeeRepo: any, deptRepo: any, posRepo: any, dataSource: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Department), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Position), useFactory: repoMockFactory },
        { provide: DataSource, useValue: { query: jest.fn() } },
        { provide: NotificationsService, useValue: { createNotification: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    employeeRepo = module.get(getRepositoryToken(Employee));
    deptRepo = module.get(getRepositoryToken(Department));
    posRepo = module.get(getRepositoryToken(Position));
    dataSource = module.get<DataSource>(DataSource);

    // Default implementations for some functions to reuse
    employeeRepo.create.mockImplementation((dto: any) => dto);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw error if email exists', async () => {
      employeeRepo.findOne.mockResolvedValue({});
      await expect(service.create({ email: 'a@a.com', password: 'p', first_name: 'f', last_name: 'l' })).rejects.toThrow(BadRequestException);
    });

    it('should hash password and create employee successfully', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      deptRepo.findOne.mockResolvedValue({ department_id: 1 });
      posRepo.findOne.mockResolvedValue({ position_id: 1 });
      employeeRepo.save.mockResolvedValue({ id: 1 });

      const dto = { email: 'a@a.com', password: 'p', first_name: 'f', last_name: 'l', department_id: 1, position_id: 1 };
      await service.create(dto);

      expect(employeeRepo.save).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed', department: { department_id: 1 }, position: { position_id: 1 } }));
    });
  });

  describe('findAll', () => {
    it('should return employees with base salary if query succeeds', async () => {
      employeeRepo.find.mockResolvedValue([{ employee_id: 1 }, { employee_id: 2 }]);
      dataSource.query.mockResolvedValue([{ employee_id: 1, base_salary: '1000' }]);

      const res = await service.findAll();
      expect((res[0] as any).base_salary).toBe('1000');
      expect((res[1] as any).base_salary).toBeNull();
      expect(dataSource.query).toHaveBeenCalled();
    });

    it('should fallback securely if salary query fails', async () => {
      employeeRepo.find.mockResolvedValue([{ employee_id: 1 }]);
      dataSource.query.mockRejectedValue(new Error('DB Error'));

      const res = await service.findAll();
      expect(res).toEqual([{ employee_id: 1 }]);
    });
  });

  describe('findOne', () => {
    it('should return employee successfully', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      expect(await service.findOne(1)).toEqual({ employee_id: 1 });
    });

    it('should throw if not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw if no employee', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
    });

    it('should update password and details, resolving department and position', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1, bankInfo: {} });
      employeeRepo.save.mockResolvedValue({ employee_id: 1 });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      deptRepo.findOne.mockResolvedValueOnce({ department_id: 2 }).mockResolvedValueOnce(null); // the second is for oldDeptAsManager check
      posRepo.findOne.mockResolvedValue({ position_id: 2 });
      
      await service.update(1, { password: 'new', first_name: 'new', department_id: 2, position_id: 2, bank_info: { bank_name: 'B' } } as any);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
      expect(employeeRepo.save).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed', first_name: 'new' }));
    });

    it('should handle employment termination and auto-terminate contracts', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      employeeRepo.save.mockResolvedValue({ employee_id: 1 });
      
      await service.update(1, { employment_status: EmploymentStatus.TERMINATED });
      expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array)); // ensure trigger runs
    });
  });

  describe('remove', () => {
    it('should throw if not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should remove manager role of dept if applicable before remove', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      deptRepo.findOne.mockResolvedValue({ department_id: 1, manager: {} });
      
      await service.remove(1);
      
      expect(deptRepo.save).toHaveBeenCalled();
      expect(employeeRepo.remove).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search by name and email mapping correctly', async () => {
      employeeRepo.find.mockResolvedValue([{ employee_id: 1, first_name: 'A', last_name: 'B', email: 'e' }]);
      const res = await service.search('A');
      expect(res[0]).toEqual({ type: 'employee', id: 1, name: 'A B', email: 'e' });
    });
  });

  describe('findAllPublic', () => {
    it('should exclude sensitive fields and only retain safe fields', async () => {
      employeeRepo.find.mockResolvedValue([{ employee_id: 1, first_name: 'A', last_name: 'B', email: 'e', department: { department_id: 1, department_name: 'D' }, position: null, phone_number: '123', address: '123 block' }]);
      const res = await service.findAllPublic({ department: { department_id: 1 } });
      expect(res[0]).toEqual({
        employee_id: 1,
        first_name: 'A',
        last_name: 'B',
        email: 'e',
        avatar_url: null,
        department: { department_id: 1, department_name: 'D' },
        position: null,
      });
      // Important security assertion
      expect((res[0] as any).phone_number).toBeUndefined();
      expect((res[0] as any).address).toBeUndefined();
    });
  });
});
