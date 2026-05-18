import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../../entities/employee.entity';
import { Position } from '../../entities/position.entity';
import { PositionPermission } from '../../entities/position-permission.entity';
import { Permission } from '../../entities/permission.entity';
import { Department } from '../../entities/department.entity';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  
  const mockJwtService = { sign: jest.fn() };
  const mockEmployeeRepo = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
  const mockPositionRepo = { findOne: jest.fn() };
  const mockDepartmentRepo = { findOne: jest.fn() };
  const mockPpRepo = { find: jest.fn() };
  const mockPermissionRepo = { find: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    jest.clearAllMocks();
  });

  // ========== getUserPermissions ==========
  describe('getUserPermissions', () => {
    it('should return empty array if no positionId', async () => {
      const result = await (service as any).getUserPermissions(null);
      expect(result).toEqual([]);
    });

    it('should return empty array if no permissions found', async () => {
      mockPpRepo.find.mockResolvedValue([]);
      const result = await (service as any).getUserPermissions(1);
      expect(result).toEqual([]);
    });

    it('should return list of permission names on success', async () => {
      mockPpRepo.find.mockResolvedValue([{ permission_id: 10 }]);
      mockPermissionRepo.find.mockResolvedValue([{ permission_name: 'READ_USERS' }]);
      const result = await (service as any).getUserPermissions(1);
      expect(result).toEqual(['READ_USERS']);
    });
  });

  // ========== updateContactInfo ==========
  describe('updateContactInfo', () => {
    it('should throw NotFoundException if employee not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      await expect(service.updateContactInfo(1, {})).rejects.toThrow(NotFoundException);
    });

    it('should update and save employee basic info and settings', async () => {
      mockEmployeeRepo.findOne.mockResolvedValueOnce({ employee_id: 1, first_name: 'Old', email: 'o@o.com' });
      mockEmployeeRepo.save.mockResolvedValue({});
      mockEmployeeRepo.findOne.mockResolvedValueOnce({ employee_id: 1, first_name: 'New', email: 'n@n.com' });
      
      await service.updateContactInfo(1, { first_name: 'New', email: 'n@n.com', dark_mode: true });
      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(expect.objectContaining({ first_name: 'New', email: 'n@n.com', dark_mode: true }));
    });

    it('should update bank info correctly if already exists', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ 
        employee_id: 1, 
        bankInfo: { bank_name: 'Bank A', account_number: '123' } 
      });
      
      await service.updateContactInfo(1, { bank_info: { bank_name: 'Bank B' } });
      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        bankInfo: expect.objectContaining({ bank_name: 'Bank B', account_number: '123' })
      }));
    });
    
    it('should create bank info correctly if not exists', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      
      await service.updateContactInfo(1, { bank_info: { bank_name: 'Bank B' } });
      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        bankInfo: { bank_name: 'Bank B' }
      }));
    });
  });

  // ========== updateAvatarUrl ==========
  describe('updateAvatarUrl', () => {
    it('should throw NotFoundException if employee not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      await expect(service.updateAvatarUrl(1, 'http')).rejects.toThrow(NotFoundException);
    });

    it('should update avatar url and save', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      const result = await service.updateAvatarUrl(1, 'http://avatar.url');
      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(expect.objectContaining({ avatar_url: 'http://avatar.url' }));
    });
  });

  // ========== validateUser ==========
  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      expect(await service.validateUser('test@email.com', 'pass')).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      expect(await service.validateUser('test@email.com', 'wrong')).toBeNull();
    });

    it('should throw UnauthorizedException if terminated and past resignation date', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ 
        password: 'hashed', employment_status: 'Terminated', resignation_date: '2000-01-01'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(service.validateUser('test', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user without password and append permissions on success', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({ 
        password: 'hashed', email: 'test@example.com', position: { position_id: 1 }
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPpRepo.find.mockResolvedValue([]);
      
      const result = await service.validateUser('test@example.com', 'pass');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('permissions', []);
    });
  });

  // ========== getProfile ==========
  describe('getProfile', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      await expect(service.getProfile(1)).rejects.toThrow(NotFoundException);
    });

    it('should return user omitting password and including permissions', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({
        password: 'pass', email: 'a@a.com', position: { position_id: 1 }
      });
      mockPpRepo.find.mockResolvedValue([]);
      
      const result = await service.getProfile(1);
      expect(result.email).toBe('a@a.com');
      expect(result.password).toBeUndefined();
      expect(result.permissions).toBeDefined();
    });
  });

  // ========== login ==========
  describe('login', () => {
    it('should return access token payload', async () => {
      mockJwtService.sign.mockReturnValue('token123');
      const result = await service.login({ employee_id: 1, email: 'a@a.com', position: { position_name: 'Admin' } });
      expect(result).toEqual({ access_token: 'token123' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'a@a.com', role: 'Admin' });
    });
  });

  // ========== registerAdminUser ==========
  describe('registerAdminUser', () => {
    const data = {
      email: 'admin@a.com', password: 'pass', secretKey: 'secret', department_id: 1, position_id: 1, first_name: 'First', last_name: 'Last',
    };

    beforeEach(() => {
      process.env.ADMIN_SECRET_KEY = 'secret';
    });

    it('should throw UnauthorizedException if secret is wrong', async () => {
      await expect(service.registerAdminUser({ ...data, secretKey: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if email exists', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue({});
      await expect(service.registerAdminUser(data)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if position not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      mockPositionRepo.findOne.mockResolvedValue(null);
      await expect(service.registerAdminUser(data)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if department not found', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      mockPositionRepo.findOne.mockResolvedValue({});
      mockDepartmentRepo.findOne.mockResolvedValue(null);
      await expect(service.registerAdminUser(data)).rejects.toThrow(BadRequestException);
    });

    it('should hash password, create, and save admin user successfully', async () => {
      mockEmployeeRepo.findOne.mockResolvedValue(null);
      mockPositionRepo.findOne.mockResolvedValue({});
      mockDepartmentRepo.findOne.mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');
      mockEmployeeRepo.create.mockReturnValue(data);
      mockEmployeeRepo.save.mockResolvedValue({ employee_id: 100 });

      const result = await service.registerAdminUser(data);
      expect(result).toEqual({ message: 'Account created successfully', id: 100 });
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
    });
  });
});
