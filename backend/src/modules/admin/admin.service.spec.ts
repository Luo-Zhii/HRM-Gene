import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanySettings } from '../../entities/company-settings.entity';
import { Department } from '../../entities/department.entity';
import { Position } from '../../entities/position.entity';
import { Permission } from '../../entities/permission.entity';
import { PositionPermission } from '../../entities/position-permission.entity';
import { Employee } from '../../entities/employee.entity';
import { Contract, ContractStatus } from '../../entities/contract.entity';
import { SalaryHistory } from '../../entities/salary-history.entity';
import { Payslip } from '../../entities/payslip.entity';
import { PayrollPeriod } from '../../entities/payroll-period.entity';
import { SalaryConfig } from '../../entities/salary-config.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;

  const repoMockFactory = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  });

  let settingsRepo: any, deptRepo: any, positionRepo: any, permissionRepo: any, posPermRepo: any, employeeRepo: any, contractRepo: any, salaryHistoryRepo: any, payslipRepo: any, payrollPeriodRepo: any, salaryConfigRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(CompanySettings), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Department), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Position), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Permission), useFactory: repoMockFactory },
        { provide: getRepositoryToken(PositionPermission), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Employee), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Contract), useFactory: repoMockFactory },
        { provide: getRepositoryToken(SalaryHistory), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Payslip), useFactory: repoMockFactory },
        { provide: getRepositoryToken(PayrollPeriod), useFactory: repoMockFactory },
        { provide: getRepositoryToken(SalaryConfig), useFactory: repoMockFactory },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    settingsRepo = module.get(getRepositoryToken(CompanySettings));
    deptRepo = module.get(getRepositoryToken(Department));
    positionRepo = module.get(getRepositoryToken(Position));
    permissionRepo = module.get(getRepositoryToken(Permission));
    posPermRepo = module.get(getRepositoryToken(PositionPermission));
    employeeRepo = module.get(getRepositoryToken(Employee));
    contractRepo = module.get(getRepositoryToken(Contract));
    salaryHistoryRepo = module.get(getRepositoryToken(SalaryHistory));
    payslipRepo = module.get(getRepositoryToken(Payslip));
    payrollPeriodRepo = module.get(getRepositoryToken(PayrollPeriod));
    salaryConfigRepo = module.get(getRepositoryToken(SalaryConfig));
    jest.clearAllMocks();
  });

  describe('Settings', () => {
    it('getAllSettings', async () => {
      settingsRepo.find.mockResolvedValue([]);
      expect(await service.getAllSettings()).toEqual([]);
    });

    it('getSetting if not exists', async () => {
      settingsRepo.findOne.mockResolvedValue(null);
      const res = await service.getSetting('test');
      expect(res.key).toBe('test');
      expect(res.value).toBe('');
    });

    it('updateSetting create new', async () => {
      settingsRepo.findOne.mockResolvedValue(null);
      settingsRepo.create.mockReturnValue({ key: 'k', value: 'v' });
      settingsRepo.save.mockResolvedValue({ key: 'k', value: 'v' });
      expect(await service.updateSetting('k', 'v')).toEqual({ key: 'k', value: 'v' });
    });

    it('updateSetting update existing', async () => {
      const existing = { key: 'k', value: 'old' };
      settingsRepo.findOne.mockResolvedValue(existing);
      settingsRepo.save.mockResolvedValue({ ...existing, value: 'v' });
      const result = await service.updateSetting('k', 'v');
      expect(result.value).toEqual('v');
    });
  });

  describe('Departments', () => {
    it('getAllDepartments', async () => {
      deptRepo.find.mockResolvedValue([{ 
        department_name: 'HR', 
        manager: { employee_id: 1, first_name: 'John', last_name: 'Doe' },
        employees: [{ contracts: [{ status: ContractStatus.ACTIVE, salary_rate: '1000' }] }]
      }]);
      const res = await service.getAllDepartments();
      expect(res[0].total_budget).toBe(1000);
      expect(res[0].manager_name).toBe('John Doe');
    });

    it('createDepartment validation', async () => {
      await expect(service.createDepartment('')).rejects.toThrow(BadRequestException);
    });

    it('updateDepartment not found', async () => {
      deptRepo.findOne.mockResolvedValue(null);
      await expect(service.updateDepartment(1, 'IT', null)).rejects.toThrow(NotFoundException);
    });

    it('updateDepartment valid manager', async () => {
      deptRepo.findOne.mockResolvedValue({ department_id: 1 });
      employeeRepo.findOne.mockResolvedValue({ department: { department_id: 1 } });
      const res = await service.updateDepartment(1, 'IT', 2);
      expect(res).toEqual({ message: 'Department updated successfully' });
    });

    it('deleteDepartment with employees', async () => {
      deptRepo.findOne.mockResolvedValue({});
      employeeRepo.count.mockResolvedValue(5);
      await expect(service.deleteDepartment(1)).rejects.toThrow(BadRequestException);
    });
    
    it('deleteDepartment success', async () => {
      deptRepo.findOne.mockResolvedValue({});
      employeeRepo.count.mockResolvedValue(0);
      expect(await service.deleteDepartment(1)).toEqual({ deleted: true, message: "Department deleted successfully" });
    });
  });

  describe('Positions & Permissions', () => {
    it('assignPermissionToPosition already exists', async () => {
      positionRepo.findOne.mockResolvedValue({});
      permissionRepo.findOne.mockResolvedValue({});
      posPermRepo.findOne.mockResolvedValue({});
      await expect(service.assignPermissionToPosition(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('revokePermissionFromPosition not found', async () => {
      positionRepo.findOne.mockResolvedValue({});
      permissionRepo.findOne.mockResolvedValue({});
      posPermRepo.findOne.mockResolvedValue(null);
      await expect(service.revokePermissionFromPosition(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Organization stats & employees', () => {
    it('getOrganizationStats', async () => {
      deptRepo.count.mockResolvedValue(5);
      employeeRepo.find.mockResolvedValue([
        { contracts: [{ status: ContractStatus.ACTIVE, salary_rate: '500' }] },
      ]);
      const res = await service.getOrganizationStats();
      expect(res).toEqual({ total_departments: 5, total_employees: 1, total_budget: 500 });
    });

    it('transferEmployee success', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      deptRepo.findOne.mockResolvedValueOnce({ department_id: 2 });
      positionRepo.findOne.mockResolvedValue({ position_id: 3 });
      deptRepo.findOne.mockResolvedValueOnce(null); 
      
      const res = await service.transferEmployee(1, 2, 3);
      expect(res.message).toBe("Employee transferred successfully");
    });
  });

  describe('Seed', () => {
    it('should throw if no employees', async () => {
      employeeRepo.find.mockResolvedValue([]);
      await expect(service.seedDemoData()).rejects.toThrow(BadRequestException);
    });

    it('should seed successfully if employee found', async () => {
      employeeRepo.find.mockResolvedValue([{ employee_id: 1 }]);
      payrollPeriodRepo.findOne.mockResolvedValue({ id: 1 });
      payslipRepo.findOne.mockResolvedValue(null);
      
      const result = await service.seedDemoData(1);
      expect(result.message).toBe('Demo data seeded successfully');
    });
  });
});
