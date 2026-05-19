import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UpdateEmployeeDto } from '../employees/dto/update-employee.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    updateContactInfo: jest.fn(),
    updateAvatarUrl: jest.fn(),
    registerAdminUser: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    set: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ========== login ==========
  describe('login', () => {
    it('should propagate exceptions thrown by validateUser', async () => {
      mockAuthService.validateUser.mockRejectedValue(new NotFoundException('Email không tồn tại trong hệ thống.'));
      await expect(controller.login({ email: 'a@a.com', password: 'w' }, mockResponse)).rejects.toThrow(NotFoundException);
    });

    it('should return token and set cookie on success', async () => {
      mockAuthService.validateUser.mockResolvedValue({ email: 'a@a.com' });
      mockAuthService.login.mockResolvedValue({ access_token: 'token123' });
      
      const res = await controller.login({ email: 'a@a.com', password: 'p' }, mockResponse);
      
      expect(res).toEqual({ success: true, user: { email: 'a@a.com' }, access_token: 'token123' });
      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', 'token123', expect.any(Object));
    });
  });

  // ========== logout ==========
  describe('logout', () => {
    it('should clear cookie and return success', async () => {
      const res = await controller.logout(mockResponse);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', expect.any(Object));
      expect(res).toEqual({ success: true });
    });
  });

  // ========== getProfile ==========
  describe('getProfile', () => {
    it('should return null if no user id', async () => {
      const res = await controller.getProfile({ user: {} }, mockResponse);
      expect(res).toBeNull();
    });

    it('should return profile successfully', async () => {
      mockAuthService.getProfile.mockResolvedValue({ email: 'a@a.com' });
      const res = await controller.getProfile({ user: { employee_id: 1 } }, mockResponse);
      expect(res).toEqual({ email: 'a@a.com' });
    });
  });

  // ========== updateProfile ==========
  describe('updateProfile', () => {
    it('should call updateContactInfo with correct payload', async () => {
      mockAuthService.updateContactInfo.mockResolvedValue({ email: 'b@b.com' });
      const res = await controller.updateProfile({ user: { id: 1 } }, { email: 'b@b.com' } as UpdateEmployeeDto);
      expect(res).toEqual({ email: 'b@b.com' });
      expect(mockAuthService.updateContactInfo).toHaveBeenCalledWith(1, { email: 'b@b.com' });
    });
  });

  // ========== uploadAvatar ==========
  describe('uploadAvatar', () => {
    it('should throw BadRequestException if no file is provided', async () => {
      await expect(controller.uploadAvatar({ user: { id: 1 } }, null as any)).rejects.toThrow(BadRequestException);
    });

    it('should update avatar url and return result', async () => {
      mockAuthService.updateAvatarUrl.mockResolvedValue({ avatar_url: 'http://loc/url' });
      const req = {
        user: { employee_id: 1 },
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost'),
      };
      const file = { filename: 'avatar.png' } as any;

      const res = await controller.uploadAvatar(req, file);
      expect(mockAuthService.updateAvatarUrl).toHaveBeenCalledWith(1, 'http://localhost/uploads/avatars/avatar.png');
    });
  });

  // ========== navigation ==========
  describe('navigation', () => {
    it('should return empty navigation if no user id', async () => {
      const res = await controller.navigation({ user: {} }, mockResponse);
      expect(res).toEqual({ main: [], admin: [] });
    });

    it('should return main only and empty admin if not an admin', async () => {
      mockAuthService.getProfile.mockResolvedValue({ position: { position_name: 'Employee' } });
      const res = await controller.navigation({ user: { id: 1 } }, mockResponse);
      
      expect(res.main.length).toBeGreaterThan(0);
      expect(res.admin).toEqual([]);
      expect(mockResponse.set).toHaveBeenCalled();
    });

    it('should return main and admin items if is admin', async () => {
      mockAuthService.getProfile.mockResolvedValue({ position: { position_name: 'Admin' } });
      const res = await controller.navigation({ user: { id: 1 } }, mockResponse);
      
      expect(res.main.length).toBeGreaterThan(0);
      expect(res.admin.length).toBeGreaterThan(0);
    });
  });

  // ========== adminRegister ==========
  describe('adminRegister', () => {
    it('should throw BadRequestException if required fields are missing', async () => {
      await expect(controller.adminRegister({} as any)).rejects.toThrow(BadRequestException);
    });

    it('should call registerAdminUser on success and return its result', async () => {
      const data = {
        email: 'a@a.com',
        password: 'p',
        department_id: 1,
        position_id: 1,
        secretKey: 's',
        first_name: 'f',
        last_name: 'l',
      };
      mockAuthService.registerAdminUser.mockResolvedValue({ message: 'Success', id: 1 });
      
      const res = await controller.adminRegister(data);
      expect(res).toEqual({ message: 'Success', id: 1 });
      expect(mockAuthService.registerAdminUser).toHaveBeenCalledWith(data);
    });
  });
});
