import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    getAllSettings: jest.fn(),
    getSetting: jest.fn(),
    updateSetting: jest.fn(),
    getOrganizationStats: jest.fn(),
    getAllDepartments: jest.fn(),
    createDepartment: jest.fn(),
    updateDepartment: jest.fn(),
    getAllPositions: jest.fn(),
    createPosition: jest.fn(),
    getPermissionMatrix: jest.fn(),
    assignPermissionToPosition: jest.fn(),
    revokePermissionFromPosition: jest.fn(),
    getAllEmployees: jest.fn(),
    getBasicEmployees: jest.fn(),
    transferEmployee: jest.fn(),
    seedDemoData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    jest.clearAllMocks();
  });

  describe('System Settings', () => {
    it('getAllSettings', async () => {
      mockAdminService.getAllSettings.mockResolvedValue([]);
      expect(await controller.getAllSettings()).toEqual([]);
    });

    it('getSetting', async () => {
      mockAdminService.getSetting.mockResolvedValue({});
      expect(await controller.getSetting('k')).toEqual({});
    });

    it('updateSetting', async () => {
      mockAdminService.updateSetting.mockResolvedValue({});
      expect(await controller.updateSetting({ key: 'k', value: 'v' })).toEqual({});
      expect(mockAdminService.updateSetting).toHaveBeenCalledWith('k', 'v');
    });
  });

  describe('Organization', () => {
    it('getOrganizationStats', async () => {
      mockAdminService.getOrganizationStats.mockResolvedValue({});
      expect(await controller.getOrganizationStats()).toEqual({});
    });
  });

  describe('Departments', () => {
    it('getAllDepartments', async () => {
      mockAdminService.getAllDepartments.mockResolvedValue([]);
      expect(await controller.getAllDepartments()).toEqual([]);
    });

    it('createDepartment', async () => {
      mockAdminService.createDepartment.mockResolvedValue({});
      expect(await controller.createDepartment({ department_name: 'D' })).toEqual({});
      expect(mockAdminService.createDepartment).toHaveBeenCalledWith('D');
    });

    it('updateDepartment', async () => {
      mockAdminService.updateDepartment.mockResolvedValue({});
      expect(await controller.updateDepartment(1, { department_name: 'D', manager_id: 2 })).toEqual({});
      expect(mockAdminService.updateDepartment).toHaveBeenCalledWith(1, 'D', 2);
    });
  });

  describe('Positions', () => {
    it('getAllPositions', async () => {
      mockAdminService.getAllPositions.mockResolvedValue([]);
      expect(await controller.getAllPositions()).toEqual([]);
    });

    it('createPosition', async () => {
      mockAdminService.createPosition.mockResolvedValue({});
      expect(await controller.createPosition({ position_name: 'P' })).toEqual({});
      expect(mockAdminService.createPosition).toHaveBeenCalledWith('P');
    });
  });

  describe('Permissions', () => {
    it('getPermissionMatrix', async () => {
      mockAdminService.getPermissionMatrix.mockResolvedValue([]);
      expect(await controller.getPermissionMatrix()).toEqual([]);
    });

    it('assignPermission', async () => {
      mockAdminService.assignPermissionToPosition.mockResolvedValue({});
      expect(await controller.assignPermission({ position_id: 1, permission_id: 2 })).toEqual({});
    });

    it('revokePermission', async () => {
      mockAdminService.revokePermissionFromPosition.mockResolvedValue({});
      expect(await controller.revokePermission({ position_id: 1, permission_id: 2 })).toEqual({});
    });
  });

  describe('Employees', () => {
    it('getAllEmployees', async () => {
      mockAdminService.getAllEmployees.mockResolvedValue([]);
      expect(await controller.getAllEmployees()).toEqual([]);
    });

    it('getBasicEmployees', async () => {
      mockAdminService.getBasicEmployees.mockResolvedValue([]);
      expect(await controller.getBasicEmployees()).toEqual([]);
    });

    it('transferEmployee', async () => {
      mockAdminService.transferEmployee.mockResolvedValue({});
      expect(await controller.transferEmployee(1, { department_id: 2, position_id: 3 })).toEqual({});
    });
  });

  describe('Seed Demo Data', () => {
    it('seedDemoData without arg', async () => {
      mockAdminService.seedDemoData.mockResolvedValue({});
      expect(await controller.seedDemoData()).toEqual({});
      expect(mockAdminService.seedDemoData).toHaveBeenCalledWith(undefined);
    });

    it('seedDemoData with arg', async () => {
      mockAdminService.seedDemoData.mockResolvedValue({});
      expect(await controller.seedDemoData({ employee_id: 1 })).toEqual({});
      expect(mockAdminService.seedDemoData).toHaveBeenCalledWith(1);
    });
  });
});
