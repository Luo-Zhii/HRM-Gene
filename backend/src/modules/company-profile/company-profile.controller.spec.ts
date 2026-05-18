import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfileController } from './company-profile.controller';
import { CompanyProfileService } from './company-profile.service';
import { BadRequestException } from '@nestjs/common';

describe('CompanyProfileController', () => {
  let controller: CompanyProfileController;

  const mockService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateLogo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyProfileController],
      providers: [
        { provide: CompanyProfileService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<CompanyProfileController>(CompanyProfileController);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return company profile via service', async () => {
      mockService.getProfile.mockResolvedValue({ id: 1 });
      expect(await controller.getProfile()).toEqual({ id: 1 });
    });
  });

  describe('updateProfile', () => {
    it('should load current profile and update it', async () => {
      mockService.getProfile.mockResolvedValue({ id: 1 });
      mockService.updateProfile.mockResolvedValue({ id: 1, name: 'T' });
      
      const res = await controller.updateProfile({ company_name: 'T' });
      
      expect(mockService.updateProfile).toHaveBeenCalledWith(1, { company_name: 'T' });
      expect(res).toEqual({ id: 1, name: 'T' });
    });
  });

  describe('uploadLogo', () => {
    it('should throw BadRequestException if file is intrinsically missing', async () => {
      await expect(controller.uploadLogo(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should update profile logo URL', async () => {
      mockService.getProfile.mockResolvedValue({ id: 1 });
      mockService.updateLogo.mockResolvedValue({ id: 1, logo_url: 'u' });
      
      const file = { filename: 'a.png' } as any;
      const res = await controller.uploadLogo(file);
      
      expect(mockService.updateLogo).toHaveBeenCalledWith(1, '/uploads/company/a.png');
      expect(res).toEqual({ id: 1, logo_url: 'u' });
    });
  });
});
