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
    // [TC_BE_LEAVE_191]
    it('getLeaveTypes: Lấy danh sách loại nghỉ phép', async () => {
      mockService.getLeaveTypes.mockResolvedValue([]);
      expect(await controller.getLeaveTypes()).toEqual([]);
    });
  });

  describe('getBalance / getMyRequests', () => {
    // [TC_BE_LEAVE_192]
    it('getBalance: Lấy số dư ngày phép của user từ token', async () => {
      mockService.getBalance.mockResolvedValue([]);
      const req = { user: { employee_id: 1 } };
      expect(await controller.getBalance(req)).toEqual([]);
      expect(mockService.getBalance).toHaveBeenCalledWith(1);
    });

    // [TC_BE_LEAVE_193]
    it('getMyRequests: Lấy danh sách đơn nghỉ phép của chính mình', async () => {
      mockService.getMyRequests.mockResolvedValue([]);
      const req = { user: { employee_id: 1 } };
      expect(await controller.getMyRequests(req)).toEqual([]);
      expect(mockService.getMyRequests).toHaveBeenCalledWith(1);
    });
  });

  describe('submitLeaveRequest', () => {
    // [TC_BE_LEAVE_194]
    it('submitLeaveRequest: Gửi đơn nghỉ phép với đầy đủ thông tin', async () => {
      mockService.submitRequest.mockResolvedValue({ id: 1 });
      const req = { user: { employee_id: 1 } };
      const body = { leave_type_id: 2, start_date: '2026', end_date: '2026', reason: 'sick' };
      
      expect(await controller.submitLeaveRequest(req, body)).toEqual({ id: 1 });
      expect(mockService.submitRequest).toHaveBeenCalledWith(1, 2, '2026', '2026', 'sick');
    });
  });

  describe('getPendingRequests', () => {
    // [TC_BE_LEAVE_195]
    it('getPendingRequests: Lấy danh sách đơn nghỉ phép đang chờ duyệt', async () => {
      mockService.getPendingRequests.mockResolvedValue([]);
      expect(await controller.getPendingRequests()).toEqual([]);
    });
  });

  describe('approveLeaveRequest', () => {
    // [TC_BE_LEAVE_196]
    it('approveLeaveRequest: Admin duyệt/từ chối đơn nghỉ phép với ghi chú', async () => {
      mockService.approveLeaveRequest.mockResolvedValue({});
      const req = { user: { employee_id: 2 } };
      const body = { status: 'Approved', reason: 'note' };
      
      expect(await controller.approveLeaveRequest('1', req, body)).toEqual({});
      expect(mockService.approveLeaveRequest).toHaveBeenCalledWith(1, 'Approved', 2, 'note');
    });
  });
});
