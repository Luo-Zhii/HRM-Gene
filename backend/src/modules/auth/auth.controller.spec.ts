import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    updateContactInfo: jest.fn(),
    updateAvatarUrl: jest.fn(),
    changePassword: jest.fn(),
    registerAdminUser: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    set: jest.fn(),
  } as any;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== LOGIN ====================
  describe('login', () => {
    /**
     * @TestID: TC_BE_AUTH_CTRL_01
     * @Priority: P1
     * @Category: Positive
     * @Description: Login with valid credentials should return user data, token, and set cookie
     * @Steps:
     * 1. Arrange: validateUser returns user, login returns { access_token: 'token' }
     * 2. Act: Call controller.login({ email: 'admin@example.com', password: 'admin' }, mockResponse)
     * 3. Assert: Returns success=true, user, access_token; cookie set
     * @TestData: email=admin@example.com, password=admin
     * @ExpectedResult: { success: true, user: {...}, access_token: 'token' }
     */
    // [TC_BE_AUTH_048]
    it('should login successfully and return user with access token and set cookie', async () => {
      const user = { employee_id: 1, email: 'admin@example.com', first_name: 'Admin' };
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue({ access_token: 'jwt_token_abc' });

      const result = await controller.login(
        { email: 'admin@example.com', password: 'admin' },
        mockResponse,
      );

      expect(result).toEqual({
        success: true,
        user: user,
        access_token: 'jwt_token_abc',
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt_token_abc',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_02
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Login with non-existent email should propagate NotFoundException
     * @Steps:
     * 1. Arrange: validateUser rejects with NotFoundException
     * 2. Act: Call controller.login
     * 3. Assert: NotFoundException propagated
     * @TestData: email=notfound@example.com
     * @ExpectedResult: NotFoundException thrown
     */
    // [TC_BE_AUTH_049]
    it('should propagate NotFoundException when user email not found', async () => {
      mockAuthService.validateUser.mockRejectedValue(
        new NotFoundException('Email khong ton tai trong he thong.')
      );

      await expect(
        controller.login({ email: 'notfound@example.com', password: 'p' }, mockResponse)
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_03
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Login with wrong password should propagate UnauthorizedException
     * @Steps:
     * 1. Arrange: validateUser rejects with UnauthorizedException
     * 2. Act: Call controller.login
     * 3. Assert: UnauthorizedException propagated
     * @TestData: wrong password
     * @ExpectedResult: UnauthorizedException thrown
     */
    // [TC_BE_AUTH_050]
    it('should propagate UnauthorizedException when password is wrong', async () => {
      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Sai mat khau.')
      );

      await expect(
        controller.login({ email: 'user@example.com', password: 'wrong' }, mockResponse)
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_04
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Login for locked account should propagate UnauthorizedException
     * @Steps:
     * 1. Arrange: validateUser rejects with UnauthorizedException (locked)
     * 2. Act: Call controller.login
     * 3. Assert: UnauthorizedException propagated
     * @TestData: account locked (failed_attempts >= 5)
     * @ExpectedResult: UnauthorizedException thrown
     */
    // [TC_BE_AUTH_051]
    it('should propagate UnauthorizedException when account is locked', async () => {
      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Tai khoan da bi khoa do nhap sai qua 5 lan.')
      );

      await expect(
        controller.login({ email: 'user@example.com', password: 'p' }, mockResponse)
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==================== LOGOUT ====================
  describe('logout', () => {
    /**
     * @TestID: TC_BE_AUTH_CTRL_05
     * @Priority: P2
     * @Category: Positive
     * @Description: Logout should clear the access_token cookie and return success
     * @Steps:
     * 1. Arrange: No mocks needed
     * 2. Act: Call controller.logout(mockResponse)
     * 3. Assert: clearCookie called, returns { success: true }
     * @TestData: none
     * @ExpectedResult: { success: true }
     */
    // [TC_BE_AUTH_052]
    it('should clear cookie and return success on logout', async () => {
      const result = await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ==================== GET PROFILE ====================
  describe('getProfile', () => {
    /**
     * @TestID: TC_BE_AUTH_CTRL_06
     * @Priority: P1
     * @Category: Positive
     * @Description: Get profile for authenticated user should return profile data
     * @Steps:
     * 1. Arrange: getProfile returns employee profile
     * 2. Act: Call controller.getProfile({ user: { employee_id: 1 } }, mockResponse)
     * 3. Assert: Profile data returned
     * @TestData: employee_id=1
     * @ExpectedResult: Profile object
     */
    // [TC_BE_AUTH_053]
    it('should return user profile for authenticated user', async () => {
      const profile = { employee_id: 1, email: 'admin@example.com', first_name: 'Admin' };
      mockAuthService.getProfile.mockResolvedValue(profile);

      const result = await controller.getProfile(
        { user: { employee_id: 1 } },
        mockResponse,
      );

      expect(result).toEqual(profile);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_07
     * @Priority: P2
     * @Category: Negative
     * @Description: Get profile without user id should return null
     * @Steps:
     * 1. Arrange: req.user has no employee_id or id
     * 2. Act: Call controller.getProfile
     * 3. Assert: Returns null
     * @TestData: empty user object
     * @ExpectedResult: null
     */
    // [TC_BE_AUTH_054]
    it('should return null when user has no employee_id', async () => {
      const result = await controller.getProfile({ user: {} }, mockResponse);
      expect(result).toBeNull();
      expect(mockAuthService.getProfile).not.toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_08
     * @Priority: P2
     * @Category: Positive
     * @Description: Get profile using user.id as fallback identifier
     * @Steps:
     * 1. Arrange: req.user has id but not employee_id
     * 2. Act: Call controller.getProfile
     * 3. Assert: getProfile called with id value
     * @TestData: user.id=5
     * @ExpectedResult: getProfile called with 5
     */
    // [TC_BE_AUTH_055]
    it('should use user.id as fallback when employee_id is missing', async () => {
      const profile = { employee_id: 5, email: 'user@example.com' };
      mockAuthService.getProfile.mockResolvedValue(profile);

      const result = await controller.getProfile(
        { user: { id: 5 } },
        mockResponse,
      );

      expect(result).toEqual(profile);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(5);
    });
  });

  // ==================== UPDATE PROFILE ====================
  describe('updateProfile', () => {
    /**
     * @TestID: TC_BE_AUTH_CTRL_09
     * @Priority: P1
     * @Category: Positive
     * @Description: Update profile should call updateContactInfo with correct parameters
     * @Steps:
     * 1. Arrange: updateContactInfo returns updated profile
     * 2. Act: Call controller.updateProfile({ user: { id: 1 } }, { first_name: 'New' })
     * 3. Assert: updateContactInfo called with 1 and update data
     * @TestData: update first_name to 'New'
     * @ExpectedResult: Updated profile returned
     */
    // [TC_BE_AUTH_056]
    it('should update profile and return result', async () => {
      mockAuthService.updateContactInfo.mockResolvedValue({
        employee_id: 1, first_name: 'New', email: 'a@a.com',
      });

      const result = await controller.updateProfile(
        { user: { id: 1 } },
        { first_name: 'New' } as any,
      );

      expect(result.first_name).toBe('New');
      expect(mockAuthService.updateContactInfo).toHaveBeenCalledWith(1, { first_name: 'New' });
    });
  });

  // ==================== UPLOAD AVATAR ====================
  describe('uploadAvatar', () => {
    /**
     * @TestID: TC_BE_AUTH_CTRL_10
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Upload avatar without file should throw BadRequestException
     * @Steps:
     * 1. Arrange: file is null/undefined
     * 2. Act: Call controller.uploadAvatar({ user: { id: 1 } }, null)
     * 3. Assert: BadRequestException thrown
     * @TestData: no file
     * @ExpectedResult: BadRequestException('File is required or invalid format')
     */
    // [TC_BE_AUTH_057]
    it('should throw BadRequestException when no file is provided', async () => {
      await expect(
        controller.uploadAvatar({ user: { id: 1 } }, null as any),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_11
     * @Priority: P2
     * @Category: Positive
     * @Description: Upload avatar with valid file should construct URL and call updateAvatarUrl
     * @Steps:
     * 1. Arrange: Valid file with filename, req with protocol and host
     * 2. Act: Call controller.uploadAvatar
     * 3. Assert: updateAvatarUrl called with constructed URL
     * @TestData: file.filename='avatar-123.png', protocol=http, host=localhost:3001
     * @ExpectedResult: updateAvatarUrl called with http://localhost:3001/uploads/avatars/avatar-123.png
     */
    // [TC_BE_AUTH_058]
    it('should construct avatar URL and call updateAvatarUrl', async () => {
      mockAuthService.updateAvatarUrl.mockResolvedValue({ avatar_url: 'http://localhost:3001/uploads/avatars/avatar.png' });
      const req = {
        user: { employee_id: 1 },
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3001'),
      };
      const file = { filename: 'avatar.png' } as any;

      const result = await controller.uploadAvatar(req, file);

      expect(mockAuthService.updateAvatarUrl).toHaveBeenCalledWith(
        1,
        'http://localhost:3001/uploads/avatars/avatar.png',
      );
    });
  });

  // ==================== CHANGE PASSWORD ====================
  describe('changePassword', () => {
    /**
     * @TestID: TC_BE_AUTH_CTRL_12
     * @Priority: P1
     * @Category: Positive
     * @Description: Change password should call authService.changePassword with correct params
     * @Steps:
     * 1. Arrange: changePassword returns success message
     * 2. Act: Call controller.changePassword({ user: { employee_id: 1 } }, { currentPassword: 'old', newPassword: 'new123' })
     * 3. Assert: Service called with correct params
     * @TestData: current=old, new=new123
     * @ExpectedResult: { message: 'Password changed successfully' }
     */
    // [TC_BE_AUTH_059]
    it('should delegate to authService.changePassword', async () => {
      const msg = { message: 'Password changed successfully' };
      mockAuthService.changePassword.mockResolvedValue(msg);

      const result = await controller.changePassword(
        { user: { employee_id: 1 } },
        { currentPassword: 'old', newPassword: 'new123' },
      );

      expect(result).toEqual(msg);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(1, 'old', 'new123');
    });
  });

  // ==================== NAVIGATION ====================
  describe('navigation', () => {
    /**
     * @TestID: TC_BE_AUTH_CTRL_13
     * @Priority: P2
     * @Category: Positive
     * @Description: Navigation for non-admin user should return main items only, admin empty
     * @Steps:
     * 1. Arrange: getProfile returns position_name='Staff'
     * 2. Act: Call controller.navigation({ user: { id: 1 } }, mockResponse)
     * 3. Assert: main has items, admin is empty array
     * @TestData: position=Staff
     * @ExpectedResult: { main: [...], admin: [] }
     */
    // [TC_BE_AUTH_060]
    it('should return main nav only and empty admin for non-admin user', async () => {
      mockAuthService.getProfile.mockResolvedValue({
        position: { position_name: 'Staff' },
      });

      const result = await controller.navigation({ user: { id: 1 } }, mockResponse);

      expect(result.main.length).toBeGreaterThan(0);
      expect(result.admin).toEqual([]);
      expect(mockResponse.set).toHaveBeenCalled();
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_14
     * @Priority: P2
     * @Category: Positive
     * @Description: Navigation for Director should return full admin nav items
     * @Steps:
     * 1. Arrange: getProfile returns position_name='Director'
     * 2. Act: Call controller.navigation
     * 3. Assert: main and admin both have items
     * @TestData: position=Director
     * @ExpectedResult: { main: [...], admin: [...] }
     */
    // [TC_BE_AUTH_061]
    it('should return full admin nav for Director', async () => {
      mockAuthService.getProfile.mockResolvedValue({
        position: { position_name: 'Director' },
      });

      const result = await controller.navigation({ user: { id: 1 } }, mockResponse);

      expect(result.main.length).toBeGreaterThan(0);
      expect(result.admin.length).toBeGreaterThan(0);
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_15
     * @Priority: P2
     * @Category: Negative
     * @Description: Navigation without user id should return empty arrays
     * @Steps:
     * 1. Arrange: req.user has no id/employee_id
     * 2. Act: Call controller.navigation
     * 3. Assert: Returns { main: [], admin: [] }
     * @TestData: empty user
     * @ExpectedResult: { main: [], admin: [] }
     */
    // [TC_BE_AUTH_062]
    it('should return empty navigation when no user id', async () => {
      const result = await controller.navigation({ user: {} }, mockResponse);
      expect(result).toEqual({ main: [], admin: [] });
    });
  });

  // ==================== ADMIN REGISTER ====================
  describe('adminRegister', () => {
    const validAdminData = {
      email: 'newadmin@example.com',
      password: 'adminpass123',
      department_id: 1,
      position_id: 1,
      secretKey: 'secret',
      first_name: 'Admin',
      last_name: 'User',
    };

    /**
     * @TestID: TC_BE_AUTH_CTRL_16
     * @Priority: P1
     * @Category: Exception Handling
     * @Description: Admin register with missing required fields should throw BadRequestException
     * @Steps:
     * 1. Arrange: Request body missing email, password, etc.
     * 2. Act: Call controller.adminRegister({})
     * 3. Assert: BadRequestException thrown
     * @TestData: empty body
     * @ExpectedResult: BadRequestException('All fields are required')
     */
    // [TC_BE_AUTH_063]
    it('should throw BadRequestException when required fields are missing', async () => {
      await expect(controller.adminRegister({} as any)).rejects.toThrow(BadRequestException);
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_17
     * @Priority: P1
     * @Category: Positive
     * @Description: Admin register with all valid fields should delegate to service and return result
     * @Steps:
     * 1. Arrange: registerAdminUser returns success
     * 2. Act: Call controller.adminRegister(validAdminData)
     * 3. Assert: registerAdminUser called with correct data
     * @TestData: valid admin registration data
     * @ExpectedResult: { message: 'Account created successfully', id: 100 }
     */
    // [TC_BE_AUTH_064]
    it('should delegate to registerAdminUser and return result on success', async () => {
      mockAuthService.registerAdminUser.mockResolvedValue({
        message: 'Account created successfully',
        id: 100,
      });

      const result = await controller.adminRegister(validAdminData);

      expect(result).toEqual({ message: 'Account created successfully', id: 100 });
      expect(mockAuthService.registerAdminUser).toHaveBeenCalledWith(validAdminData);
    });

    /**
     * @TestID: TC_BE_AUTH_CTRL_18
     * @Priority: P2
     * @Category: Exception Handling
     * @Description: Admin register with wrong secret should propagate UnauthorizedException from service
     * @Steps:
     * 1. Arrange: registerAdminUser rejects with UnauthorizedException
     * 2. Act: Call controller.adminRegister with wrong secret
     * 3. Assert: UnauthorizedException propagated
     * @TestData: secretKey=wrong_secret
     * @ExpectedResult: UnauthorizedException thrown
     */
    // [TC_BE_AUTH_065]
    it('should propagate UnauthorizedException from wrong secret key', async () => {
      mockAuthService.registerAdminUser.mockRejectedValue(
        new UnauthorizedException('Invalid system secret key')
      );

      await expect(
        controller.adminRegister({ ...validAdminData, secretKey: 'wrong' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
