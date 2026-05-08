import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { ResignationRequest } from '../../entities/resignation-request.entity';
import { Employee } from '../../entities/employee.entity';
import { LeaveBalance } from '../../entities/leave-balance.entity';
import { LeaveType } from '../../entities/leave-type.entity';
import { AnnouncementsService } from '../announcements/announcements.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const repoMockFactory = () => ({
    count: jest.fn(),
    findOne: jest.fn(),
  });

  let leaveRepo: any, resignationRepo: any, leaveBalanceRepo: any, announcementsService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(LeaveRequest), useFactory: repoMockFactory },
        { provide: getRepositoryToken(ResignationRequest), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Employee), useFactory: repoMockFactory },
        { provide: getRepositoryToken(LeaveBalance), useFactory: repoMockFactory },
        { provide: getRepositoryToken(LeaveType), useFactory: repoMockFactory },
        { provide: AnnouncementsService, useValue: { getFeed: jest.fn() } },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    leaveRepo = module.get(getRepositoryToken(LeaveRequest));
    resignationRepo = module.get(getRepositoryToken(ResignationRequest));
    leaveBalanceRepo = module.get(getRepositoryToken(LeaveBalance));
    announcementsService = module.get<AnnouncementsService>(AnnouncementsService);
    jest.clearAllMocks();
  });

  describe('getEmployeeData', () => {
    it('should return employee dashboard data accurately and find correct user id', async () => {
      announcementsService.getFeed.mockResolvedValue([{ title: 'News 1' }, { title: 'News 2' }]);
      leaveBalanceRepo.findOne.mockResolvedValue({ remaining_days: 10 });
      
      const user = { employee_id: 1 };
      const result = await service.getEmployeeData(user);
      
      expect(result.stats.ptoBalance).toBe(10);
      expect(result.recentAnnouncements.length).toBe(2);
      expect(result.nextHoliday).toBeDefined();
    });

    it('should handle zero PTO balance when no record is found', async () => {
      announcementsService.getFeed.mockResolvedValue([]);
      leaveBalanceRepo.findOne.mockResolvedValue(null);
      
      const user = { sub: 2 };
      const result = await service.getEmployeeData(user);
      
      expect(result.stats.ptoBalance).toBe(0);
      expect(result.recentAnnouncements.length).toBe(0);
    });
  });

  describe('getAdminData', () => {
    it('should return admin statistics accurately', async () => {
      leaveRepo.count.mockResolvedValue(5);
      resignationRepo.count.mockResolvedValue(2);
      
      const result = await service.getAdminData();
      
      expect(result.pendingApprovals.leaveRequests).toBe(5);
      expect(result.pendingApprovals.resignations).toBe(2);
    });
  });

  describe('getHolidayList', () => {
    it('should return sorted holidays array', () => {
      const result = service.getHolidayList();
      expect(result.length).toBeGreaterThan(0);
      const isSorted = new Date(result[0].date).getTime() <= new Date(result[1].date).getTime();
      expect(isSorted).toBeTruthy();
    });
  });

  describe('getNextHoliday', () => {
    it('should return the next holiday or the first array entry if all are past', () => {
      const result = (service as any).getNextHoliday();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('date');
    });
  });
});
