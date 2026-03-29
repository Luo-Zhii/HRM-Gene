import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyProfile } from '../../entities/company-profile.entity';

@Injectable()
export class CompanyProfileService {
  constructor(
    @InjectRepository(CompanyProfile)
    private profileRepo: Repository<CompanyProfile>,
  ) {}

  async getProfile(): Promise<CompanyProfile> {
    let profile = await this.profileRepo.findOne({ where: {} });
    if (!profile) {
      // Create a default profile if none exists
      profile = this.profileRepo.create({
        company_name: 'Gene HRM',
        base_currency: 'USD',
      });
      await this.profileRepo.save(profile);
    }
    return profile;
  }

  async updateProfile(id: number, data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    await this.profileRepo.update(id, data);
    return this.getProfile();
  }

  async updateLogo(id: number, logoUrl: string): Promise<CompanyProfile> {
    await this.profileRepo.update(id, { logo_url: logoUrl });
    return this.getProfile();
  }
}
