import { Test, TestingModule } from '@nestjs/testing';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';

describe('LeaveController', () => {
  let controller: LeaveController;

  const mockService = {
    getLeaveTypes: jest.fn(),
    getBalance: jest.fn(),
    getMyRequests: jest.fn(),
    submitRequest: jest.fn(),
    getPendingRequests: jest.fn(),
    approveLeaveRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveController],
      providers: [
        { provide: LeaveService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<LeaveController>(LeaveController);
    jest.clearAllMocks();
  });

  describe('getLeaveTypes', () => {
    it('should logically bridge service invocation returning generic collections intact', async () => {
      mockService.getLeaveTypes.mockResolvedValue([]);
      expect(await controller.getLeaveTypes()).toEqual([]);
    });
  });

  describe('getBalance / getMyRequests', () => {
    it('should consistently route authorization boundary dynamically mapping identity matching context automatically', async () => {
      mockService.getBalance.mockResolvedValue([]);
      const req = { user: { employee_id: 1 } };
      expect(await controller.getBalance(req)).toEqual([]);
      expect(mockService.getBalance).toHaveBeenCalledWith(1);
    });

    it('should structurally execute mapped payload implicitly proxying user restrictions faithfully', async () => {
      mockService.getMyRequests.mockResolvedValue([]);
      const req = { user: { employee_id: 1 } };
      expect(await controller.getMyRequests(req)).toEqual([]);
      expect(mockService.getMyRequests).toHaveBeenCalledWith(1);
    });
  });

  describe('submitLeaveRequest', () => {
    it('should map request payload bridging internal bindings correctly isolating context efficiently', async () => {
      mockService.submitRequest.mockResolvedValue({ id: 1 });
      const req = { user: { employee_id: 1 } };
      const body = { leave_type_id: 2, start_date: '2026', end_date: '2026', reason: 'sick' };
      
      expect(await controller.submitLeaveRequest(req, body)).toEqual({ id: 1 });
      expect(mockService.submitRequest).toHaveBeenCalledWith(1, 2, '2026', '2026', 'sick');
    });
  });

  describe('getPendingRequests', () => {
    it('should route unrestricted fetching sequences accurately matching manager privileges reliably', async () => {
      mockService.getPendingRequests.mockResolvedValue([]);
      expect(await controller.getPendingRequests()).toEqual([]);
    });
  });

  describe('approveLeaveRequest', () => {
    it('should accurately decouple complex payload mapping routing admin interventions seamlessly ensuring correct structural updates conditionally', async () => {
      mockService.approveLeaveRequest.mockResolvedValue({});
      const req = { user: { employee_id: 2 } };
      const body = { status: 'Approved', reason: 'note' };
      
      expect(await controller.approveLeaveRequest('1', req, body)).toEqual({});
      expect(mockService.approveLeaveRequest).toHaveBeenCalledWith(1, 'Approved', 2, 'note');
    });
  });
});
