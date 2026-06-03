import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    // [TC_BE_NOTIFI_213]
    it('Từ chối client không có auth token', async () => {
      const mockClient = { handshake: {}, disconnect: jest.fn(), data: {} } as any;
      gateway.handleConnection(mockClient);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    // [TC_BE_NOTIFI_214]
    it('Xác thực JWT token và gán userId vào client data', async () => {
      const mockClient = { handshake: { auth: { token: 'token' } }, disconnect: jest.fn(), data: {}, id: '1' } as any;
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      gateway.handleConnection(mockClient);
      expect(mockClient.data.userId).toBe(1);
    });

    // [TC_BE_NOTIFI_215]
    it('Ngắt kết nối khi JWT token không hợp lệ', async () => {
      const mockClient = { handshake: { auth: { token: 'token' } }, disconnect: jest.fn(), data: {} } as any;
      mockJwtService.verify.mockImplementation(() => { throw new Error(); });
      gateway.handleConnection(mockClient);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    // [TC_BE_NOTIFI_216]
    it('Xóa socket khỏi userSockets map khi client ngắt kết nối', async () => {
      const mockClient = { handshake: { auth: { token: 'token' } }, disconnect: jest.fn(), data: {}, id: '1' } as any;
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      gateway.handleConnection(mockClient);

      gateway.handleDisconnect(mockClient);
      expect(gateway['userSockets'].get(1)).toBeUndefined();
    });
  });

  describe('sendNotificationToUser', () => {
    // [TC_BE_NOTIFI_217]
    it('Emit notification đến đúng socket của user qua server.to()', async () => {
      gateway['userSockets'].set(1, new Set(['1']));
      gateway.sendNotificationToUser(1, { message: 'hello' });
      expect(gateway.server.to).toHaveBeenCalledWith('1');
      expect(gateway.server.emit).toHaveBeenCalledWith('newNotification', { message: 'hello' });
    });
  });
});
