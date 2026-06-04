import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let module: TestingModule;

  const mockService = {
    getUserNotifications: jest.fn(),
    markAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    sendAnnouncementToAll: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('endpoints', () => {
    // [TC_BE_NOTIFI_212]
    it('Kiểm tra toàn bộ endpoint notifications: getUserNotifications, markAsRead, deleteNotification, createAnnouncement', async () => {
      const mockUser = { user: { employee_id: 1, position: { position_name: 'Admin' } } };

      mockService.getUserNotifications.mockResolvedValue([]);
      expect(await controller.getUserNotifications(mockUser)).toEqual([]);

      mockService.markAsRead.mockResolvedValue({});
      expect(await controller.markAsRead('1', mockUser)).toEqual({});

      mockService.deleteNotification.mockResolvedValue({});
      expect(await controller.deleteNotification('1', mockUser)).toEqual({});

      mockService.sendAnnouncementToAll.mockResolvedValue({});
      expect(await controller.createAnnouncement({ title: 't', message: 'm' }, mockUser)).toEqual({});
    });
  });
});
