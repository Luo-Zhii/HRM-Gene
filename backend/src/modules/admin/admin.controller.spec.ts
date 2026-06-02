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
    // [TC_BE_ADMIN_001]
    it('getAllSettings', async () => {
      mockAdminService.getAllSettings.mockResolvedValue([]);
      expect(await controller.getAllSettings()).toEqual([]);
    });

    // [TC_BE_ADMIN_002]
    it('getSetting', async () => {
      mockAdminService.getSetting.mockResolvedValue({});
      expect(await controller.getSetting('k')).toEqual({});
    });

    // [TC_BE_ADMIN_003]
    it('updateSetting', async () => {
      mockAdminService.updateSetting.mockResolvedValue({});
      expect(await controller.updateSetting({ key: 'k', value: 'v' })).toEqual({});
      expect(mockAdminService.updateSetting).toHaveBeenCalledWith('k', 'v');
    });
  });

  describe('Organization', () => {
    // [TC_BE_ADMIN_004]
    it('getOrganizationStats', async () => {
      mockAdminService.getOrganizationStats.mockResolvedValue({});
      expect(await controller.getOrganizationStats()).toEqual({});
    });
  });

  describe('Departments', () => {
    // [TC_BE_ADMIN_005]
    it('getAllDepartments', async () => {
      mockAdminService.getAllDepartments.mockResolvedValue([]);
      expect(await controller.getAllDepartments()).toEqual([]);
    });

    // [TC_BE_ADMIN_006]
    it('createDepartment', async () => {
      mockAdminService.createDepartment.mockResolvedValue({});
      expect(await controller.createDepartment({ department_name: 'D' })).toEqual({});
      expect(mockAdminService.createDepartment).toHaveBeenCalledWith('D');
    });

    // [TC_BE_ADMIN_007]
    it('updateDepartment', async () => {
      mockAdminService.updateDepartment.mockResolvedValue({});
      expect(await controller.updateDepartment(1, { department_name: 'D', manager_id: 2 })).toEqual({});
      expect(mockAdminService.updateDepartment).toHaveBeenCalledWith(1, 'D', 2);
    });
  });

  describe('Positions', () => {
    // [TC_BE_ADMIN_008]
    it('getAllPositions', async () => {
      mockAdminService.getAllPositions.mockResolvedValue([]);
      expect(await controller.getAllPositions()).toEqual([]);
    });

    // [TC_BE_ADMIN_009]
    it('createPosition', async () => {
      mockAdminService.createPosition.mockResolvedValue({});
      expect(await controller.createPosition({ position_name: 'P' })).toEqual({});
      expect(mockAdminService.createPosition).toHaveBeenCalledWith('P');
    });
  });

  describe('Permissions', () => {
    // [TC_BE_ADMIN_010]
    it('getPermissionMatrix', async () => {
      mockAdminService.getPermissionMatrix.mockResolvedValue([]);
      expect(await controller.getPermissionMatrix()).toEqual([]);
    });

    // [TC_BE_ADMIN_011]
    it('assignPermission', async () => {
      mockAdminService.assignPermissionToPosition.mockResolvedValue({});
      expect(await controller.assignPermission({ position_id: 1, permission_id: 2 })).toEqual({});
    });

    // [TC_BE_ADMIN_012]
    it('revokePermission', async () => {
      mockAdminService.revokePermissionFromPosition.mockResolvedValue({});
      expect(await controller.revokePermission({ position_id: 1, permission_id: 2 })).toEqual({});
    });
  });

  describe('Employees', () => {
    // [TC_BE_ADMIN_013]
    it('getAllEmployees', async () => {
      mockAdminService.getAllEmployees.mockResolvedValue([]);
      expect(await controller.getAllEmployees()).toEqual([]);
    });

    // [TC_BE_ADMIN_014]
    it('getBasicEmployees', async () => {
      mockAdminService.getBasicEmployees.mockResolvedValue([]);
      expect(await controller.getBasicEmployees()).toEqual([]);
    });

    // [TC_BE_ADMIN_015]
    it('transferEmployee', async () => {
      mockAdminService.transferEmployee.mockResolvedValue({});
      expect(await controller.transferEmployee(1, { department_id: 2, position_id: 3 })).toEqual({});
    });
  });

  describe('Seed Demo Data', () => {
    // [TC_BE_ADMIN_016]
    it('seedDemoData without arg', async () => {
      mockAdminService.seedDemoData.mockResolvedValue({});
      expect(await controller.seedDemoData()).toEqual({});
      expect(mockAdminService.seedDemoData).toHaveBeenCalledWith(undefined);
    });

    // [TC_BE_ADMIN_017]
    it('seedDemoData with arg', async () => {
      mockAdminService.seedDemoData.mockResolvedValue({});
      expect(await controller.seedDemoData({ employee_id: 1 })).toEqual({});
      expect(mockAdminService.seedDemoData).toHaveBeenCalledWith(1);
    });
  });
});
