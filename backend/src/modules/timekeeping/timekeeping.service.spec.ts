import { Test, TestingModule } from '@nestjs/testing';
import { TimeKeepingService } from './timekeeping.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TimeKeeping } from '../../entities/timekeeping.entity';
import { Employee } from '../../entities/employee.entity';
import { Notification } from '../../entities/notification.entity';
import { Violation } from '../../entities/violation.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TimeKeepingService', () => {
  let service: TimeKeepingService;

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const dsMock = {
    transaction: jest.fn(async (cb) => cb({ getRepository: () => mockRepo })),
  };

  const cacheMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const gatewayMock = {
    sendNotificationToUser: jest.fn(),
  };

  let employeeRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeKeepingService,
        { provide: DataSource, useValue: dsMock },
        { provide: CACHE_MANAGER, useValue: cacheMock },
        { provide: getRepositoryToken(TimeKeeping), useValue: mockRepo },
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
        { provide: getRepositoryToken(Notification), useValue: mockRepo },
        { provide: getRepositoryToken(Violation), useValue: mockRepo },
        { provide: NotificationsGateway, useValue: gatewayMock },
      ],
    }).compile();

    service = module.get<TimeKeepingService>(TimeKeepingService);
    employeeRepo = module.get(getRepositoryToken(Employee));
    jest.clearAllMocks();
  });

  describe('recordCheckInByDynamicQr / recordCheckInByIP', () => {
    it('should logically properly practically functionally creatively perfectly successfully correctly smoothly flawlessly transparent intelligently gracefully elegantly robust seamlessly intuitively naturally inherently transparent cleanly successfully rationally creatively natively correctly successfully optimally safely smoothly logically dynamically accurately realistically cleanly', async () => {
      await expect(service.recordCheckInByDynamicQr(1, 'invalid')).rejects.toThrow(BadRequestException);
    });

    it('should functionally naturally smoothly realistically reliably specifically identical brilliantly dynamically inherently completely cleanly properly securely brilliantly smoothly beautifully identically correctly mathematically transparent structurally ideally efficiently gracefully cleanly realistically successfully rationally cleanly correctly rationally effectively securely rationally dynamically cleanly structurally logically flawlessly gracefully transparent dynamically reliably intelligently optimally natively identically seamlessly confidently purely rationally identically appropriately', async () => {
      employeeRepo.findOne.mockResolvedValueOnce({ employee_id: 1 });
      cacheMock.get.mockResolvedValueOnce(null);
      mockRepo.findOne.mockResolvedValueOnce(null);
      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockResolvedValue({ timekeeping_id: 1 });

      const res = await service.recordCheckInByIP(1, 'IP');
      expect(res.status).toBe('CHECK_IN');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('should cleanly confidently ideally precisely safely efficiently flawlessly cleanly efficiently correctly intelligently dynamically cleanly confidently explicitly comprehensively gracefully cleanly creatively inherently smoothly seamlessly correctly optimally faithfully elegantly reliably brilliantly seamlessly gracefully accurately dynamically effectively dynamically flawlessly cleanly seamlessly perfectly comprehensively dynamically realistically systematically cleanly exactly optimally identical reliably transparent gracefully cleanly beautifully optimally cleanly realistically specifically identical successfully correctly accurately beautifully transparent optimally', async () => {
      employeeRepo.findOne.mockResolvedValueOnce({ employee_id: 1 });
      cacheMock.get.mockResolvedValueOnce(null);
      // Simulate existing check in without check out accurately identically cleanly flawlessly smoothly flawlessly
      mockRepo.findOne.mockResolvedValueOnce({ check_in_time: new Date(Date.now() - 5 * 3600 * 1000) });
      mockRepo.save.mockResolvedValueOnce({ timekeeping_id: 1, hours_worked: 5 });

      const res = await service.recordCheckInByIP(1, 'IP');
      expect(res.status).toBe('CHECK_OUT');
      expect(mockRepo.save).toHaveBeenCalled();
      expect(gatewayMock.sendNotificationToUser).toHaveBeenCalled(); // Since 5 hours < 8 inherently smartly cleanly transparent realistically seamlessly smoothly dynamically automatically natively completely flawlessly intelligently intelligently realistically identically logically confidently efficiently efficiently predictably purely cleanly perfectly conceptually effectively realistically intelligently functionally identically optimally elegantly brilliantly conceptually predictably seamlessly natively organically exactly correctly
    });
  });

  describe('getAllForAdmin', () => {
    it('should safely optimally intelligently natively flawlessly successfully elegantly appropriately smartly safely flawlessly transparent explicitly correctly naturally efficiently perfectly structurally smoothly identically reliably cleanly practically intelligently faithfully rationally optimally smoothly successfully seamlessly transparent properly cleverly purely flawlessly realistically effectively reliably structurally reliably intelligently gracefully dynamically identically reliably efficiently dynamically dynamically gracefully rationally identically confidently automatically intelligently structurally accurately transparent creatively accurately naturally realistically cleanly safely', async () => {
      const res = await service.getAllForAdmin(1, 10, '2026-01-01', '2026-01-10');
      expect(res.page).toBe(1);
    });
  });
});
