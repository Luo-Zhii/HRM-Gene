import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Announcement } from '../../entities/announcement.entity';
import { Employee } from '../../entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let module: TestingModule;

  const mockAnnouncementRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEmployeeRepo = {
    find: jest.fn(),
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: getRepositoryToken(Announcement), useValue: mockAnnouncementRepo },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    // [TC_BE_ANNOUN_041]
    it('should create without sending notifications if delivery method is not in_app', async () => {
      const dto = { title: 'Test', target_audience: 'all', delivery_methods: [] };
      mockAnnouncementRepo.create.mockReturnValue(dto);
      mockAnnouncementRepo.save.mockResolvedValue(dto);

      const result = await service.create(dto as any);

      expect(result).toEqual(dto);
      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });

    // [TC_BE_ANNOUN_042]
    it('should create and send notifications to all employees if requested', async () => {
      const dto = { title: 'News', target_audience: 'all', delivery_methods: ['in_app'], status: 'Active' };
      mockAnnouncementRepo.create.mockReturnValue(dto);
      mockAnnouncementRepo.save.mockResolvedValue(dto);
      mockEmployeeRepo.find.mockResolvedValue([{ employee_id: 1 }]);

      const result = await service.create(dto as any);

      expect(result).toEqual(dto);
      expect(mockEmployeeRepo.find).toHaveBeenCalledWith();
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        1,
        'News',
        expect.any(String),
        NotificationType.ANNOUNCEMENT,
        '/company-news'
      );
    });

    // [TC_BE_ANNOUN_043]
    it('should create and send notifications to specific department', async () => {
      const dto = { title: 'Dept News', target_audience: 'dept_5', delivery_methods: ['in_app'], status: 'Active' };
      mockAnnouncementRepo.create.mockReturnValue(dto);
      mockAnnouncementRepo.save.mockResolvedValue(dto);
      mockEmployeeRepo.find.mockResolvedValue([{ employee_id: 2 }]);

      await service.create(dto as any);

      expect(mockEmployeeRepo.find).toHaveBeenCalledWith({
        relations: ['department'],
        where: { department: { department_id: 5 } }
      });
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    // [TC_BE_ANNOUN_044]
    it('should return all announcements ordered by created_at', async () => {
      mockAnnouncementRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockAnnouncementRepo.find).toHaveBeenCalledWith({ order: { created_at: 'DESC' } });
    });
  });

  describe('getFeed', () => {
    // [TC_BE_ANNOUN_045]
    it('should return announcements matching target audience for user', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      };
      mockAnnouncementRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getFeed({ department: { department_id: 3 } });

      expect(result).toEqual([{ id: 1 }]);
      expect(queryBuilder.where).toHaveBeenCalledWith('announcement.status = :status', { status: 'Active' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ dept: 'dept_3' })
      );
    });

    // [TC_BE_ANNOUN_046]
    it('should default to NONE_DEPT if user has no department', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockAnnouncementRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.getFeed({});

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ dept: 'NONE_DEPT' })
      );
    });
  });

  describe('delete', () => {
    // [TC_BE_ANNOUN_047]
    it('should delete an announcement by id', async () => {
      mockAnnouncementRepo.delete.mockResolvedValue({});
      await service.delete(1);
      expect(mockAnnouncementRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
