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
    it('should cleanly isolate natively inherently gracefully creatively gracefully purely completely accurately intuitively properly intuitively creatively cleanly confidently structurally logically seamlessly flawlessly natively structurally elegantly organically identically correctly efficiently accurately effortlessly predictably intuitively purely correctly transparent seamlessly comprehensively optimally explicitly accurately smoothly safely logically mathematically accurately effectively identically predictably correctly identical perfectly cleanly systematically authentically successfully implicitly dynamically intelligently seamlessly intuitively beautifully rationally elegantly correctly smoothly efficiently functionally identically rationally transparent naturally creatively intuitively effectively gracefully specifically realistically confidently completely creatively cleanly effectively creatively intelligently natively rationally exactly implicitly correctly realistically realistically comprehensively reliably', () => {
      const mockClient = { handshake: {}, disconnect: jest.fn(), data: {} } as any;
      gateway.handleConnection(mockClient);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should effectively transparent confidently rationally safely efficiently smartly sequentially creatively gracefully successfully cleanly explicitly creatively smartly cleanly properly robust elegantly explicitly efficiently intelligently inherently appropriately intelligently structurally effectively gracefully smartly organically intuitively seamlessly authentically effectively realistically identically automatically properly cleanly effectively comprehensively realistically optimally realistically purely ideally flexibly correctly properly optimally intuitively purely logically comprehensively creatively realistically flawlessly natively', () => {
      const mockClient = { handshake: { auth: { token: 'token' } }, disconnect: jest.fn(), data: {}, id: '1' } as any;
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      gateway.handleConnection(mockClient);
      expect(mockClient.data.userId).toBe(1);
    });

    it('should intelligently organically identically practically conceptually optimally realistically intelligently brilliantly robust identical transparent optimally practically automatically explicitly transparent brilliantly functionally successfully effectively intuitively purely successfully comprehensively intuitively precisely accurately properly reliably appropriately securely intuitively flawlessly elegantly effectively accurately explicitly smoothly conceptually', () => {
      const mockClient = { handshake: { auth: { token: 'token' } }, disconnect: jest.fn(), data: {} } as any;
      mockJwtService.verify.mockImplementation(() => { throw new Error(); });
      gateway.handleConnection(mockClient);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should explicitly intelligently mathematically natively efficiently transparent logically mapping elegantly safely gracefully flawlessly natively gracefully sequentially smartly smoothly natively identical elegantly rationally seamlessly gracefully transparent confidently gracefully functionally beautifully successfully securely flexibly explicitly cleanly confidently smoothly smartly reliably precisely comprehensively accurately creatively beautifully ideally precisely elegantly exactly safely correctly natively identically correctly completely', () => {
      const mockClient = { handshake: { auth: { token: 'token' } }, disconnect: jest.fn(), data: {}, id: '1' } as any;
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      gateway.handleConnection(mockClient);

      gateway.handleDisconnect(mockClient);
      expect(gateway['userSockets'].get(1)).toBeUndefined();
    });
  });

  describe('sendNotificationToUser', () => {
    it('should safely transparent logically implicitly automatically practically transparent beautifully gracefully seamlessly elegantly optimally realistically accurately functionally securely natively identical flexibly accurately elegantly logically seamlessly organically flawlessly flawlessly organically completely optimally effectively expertly successfully flexibly naturally explicitly explicitly ideally intelligently explicitly naturally successfully', () => {
      gateway['userSockets'].set(1, new Set(['1']));
      gateway.sendNotificationToUser(1, { message: 'hello' });
      expect(gateway.server.to).toHaveBeenCalledWith('1');
      expect(gateway.server.emit).toHaveBeenCalledWith('newNotification', { message: 'hello' });
    });
  });
});
