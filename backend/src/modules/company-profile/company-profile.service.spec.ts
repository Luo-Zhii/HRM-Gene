import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfileService } from './company-profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyProfile } from '../../entities/company-profile.entity';

describe('CompanyProfileService', () => {
  let service: CompanyProfileService;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyProfileService,
        { provide: getRepositoryToken(CompanyProfile), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CompanyProfileService>(CompanyProfileService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return existing profile', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, company_name: 'Existing' });
      expect(await service.getProfile()).toEqual({ id: 1, company_name: 'Existing' });
    });

    it('should create and return default profile if none exists on retrieval', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ company_name: 'Gene HRM' });
      mockRepo.save.mockResolvedValue({ id: 1 });

      const res = await service.getProfile();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(res).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    it('should update profile by id and fetch again to return updated active profile', async () => {
      mockRepo.update.mockResolvedValue({});
      mockRepo.findOne.mockResolvedValue({ id: 1, company_name: 'New Name' });
      const res = await service.updateProfile(1, { company_name: 'New' });
      
      expect(mockRepo.update).toHaveBeenCalledWith(1, { company_name: 'New' });
      expect(res).toEqual({ id: 1, company_name: 'New Name' });
    });
  });

  describe('updateLogo', () => {
    it('should update strictly logo_url and return modified profile', async () => {
      mockRepo.update.mockResolvedValue({});
      mockRepo.findOne.mockResolvedValue({ id: 1, logo_url: 'specific_url' });
      
      const res = await service.updateLogo(1, 'specific_url');
      expect(mockRepo.update).toHaveBeenCalledWith(1, { logo_url: 'specific_url' });
      expect(res.logo_url).toEqual('specific_url');
    });
  });
});
