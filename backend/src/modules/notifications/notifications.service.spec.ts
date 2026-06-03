import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';
import { Employee } from '../../entities/employee.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn().mockImplementation(o => o),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const gatewayMock = {
    sendNotificationToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockRepo },
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
        { provide: NotificationsGateway, useValue: gatewayMock },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    // [TC_BE_NOTIFI_218]
    it('Không gửi notification khi user tắt push_notifications', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ push_notifications: false });
      const res = await service.createNotification(1, 't', 'm', NotificationType.LEAVE);
      expect(res).toBeNull();
    });

    // [TC_BE_NOTIFI_219]
    it('Không gửi announcement khi user tắt announcements', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ announcements: false });
      const res = await service.createNotification(1, 't', 'm', NotificationType.ANNOUNCEMENT);
      expect(res).toBeNull();
    });

    // [TC_BE_NOTIFI_220]
    it('Tạo và gửi notification qua WebSocket thành công', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      mockRepo.save.mockResolvedValue({ id: 1 });
      const res = await service.createNotification(1, 't', 'm', NotificationType.COMMENT);
      expect(res!.id).toBe(1);
      expect(gatewayMock.sendNotificationToUser).toHaveBeenCalled();
    });
  });

  describe('getUserNotifications / markAsRead', () => {
    // [TC_BE_NOTIFI_221]
    it('Lấy danh sách thông báo của user: trả về mảng rỗng', async () => {
      mockRepo.find.mockResolvedValue([]);
      expect(await service.getUserNotifications(1)).toEqual([]);
    });

    // [TC_BE_NOTIFI_222]
    it('Đánh dấu thông báo đã đọc thành công', async () => {
      mockRepo.update.mockResolvedValue({});
      expect(await service.markAsRead(1, 1)).toEqual({ success: true });
    });
  });

  describe('deleteNotification / sendAnnouncementToAll', () => {
    // [TC_BE_NOTIFI_223]
    it('deleteNotification: Ném NotFoundException khi thông báo không tồn tại', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteNotification(1, 1)).rejects.toThrow(NotFoundException);
    });

    // [TC_BE_NOTIFI_224]
    it('deleteNotification: Xóa thông báo thành công và trả về success', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      expect(await service.deleteNotification(1, 1)).toEqual({ success: true });
    });

    // [TC_BE_NOTIFI_225]
    it('Gửi thông báo (announcement) đến tất cả người dùng', async () => {
      mockRepo.find.mockResolvedValueOnce([{ employee_id: 1, announcements: true }]);
      mockRepo.save.mockResolvedValue([{ userId: 1 }]);
      const res = await service.sendAnnouncementToAll('t', 'm');
      expect(res.success).toBe(true);
      expect(res.count).toBe(1);
    });
  });
});
