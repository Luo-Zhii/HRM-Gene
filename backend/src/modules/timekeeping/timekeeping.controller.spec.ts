import { Test, TestingModule } from '@nestjs/testing';
import { TimeKeepingController } from './timekeeping.controller';
import { TimeKeepingService } from './timekeeping.service';
import { ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanySettings } from '../../entities/company-settings.entity';

describe('TimeKeepingController', () => {
  let controller: TimeKeepingController;

  const mockService = {
    generateDynamicQr: jest.fn(),
    recordCheckInByDynamicQr: jest.fn(),
    recordCheckInByIP: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeKeepingController],
      providers: [
        { provide: TimeKeepingService, useValue: mockService },
        { provide: getRepositoryToken(CompanySettings), useValue: { findOneBy: jest.fn().mockResolvedValue({ value: '' }) } },
      ],
    }).compile();

    controller = module.get<TimeKeepingController>(TimeKeepingController);
    jest.clearAllMocks();
  });

  describe('getDynamicQr', () => {
    // [TC_BE_TIMEKE_308]
    it('getDynamicQr: Từ chối user không có thông tin (ForbiddenException)', async () => {
      await expect(controller.getDynamicQr({  } as any)).rejects.toThrow(ForbiddenException);
    });

    // [TC_BE_TIMEKE_309]
    it('getDynamicQr: Trả về QR code khi user hợp lệ', async () => {
      mockService.generateDynamicQr.mockResolvedValue({});
      expect(await controller.getDynamicQr({ user: { } } as any)).toEqual({});
    });
  });

  describe('checkInQr / checkInIp', () => {
    // [TC_BE_TIMEKE_310]
    it('Từ chối check-in QR và IP khi user không hợp lệ (ForbiddenException)', async () => {
      await expect(controller.checkInQr({ } as any, 'token')).rejects.toThrow(ForbiddenException);
      await expect(controller.checkInIp({ } as any)).rejects.toThrow(ForbiddenException);
    });

    // [TC_BE_TIMEKE_311]
    it('Check-in thành công qua QR và IP khi user hợp lệ', async () => {
      mockService.recordCheckInByDynamicQr.mockResolvedValue({});
      mockService.recordCheckInByIP.mockResolvedValue({});
      
      expect(await controller.checkInQr({ user: { employee_id: 1 } }, 't')).toEqual({});
      expect(await controller.checkInIp({ user: { employee_id: 1 }, ip: '1.2.3.4' })).toEqual({});
    });
  });
});
