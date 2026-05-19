import { Test, TestingModule } from '@nestjs/testing';
import { LeaveService } from './leave.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { LeaveBalance } from '../../entities/leave-balance.entity';
import { LeaveType } from '../../entities/leave-type.entity';
import { Employee } from '../../entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';

describe('LeaveService', () => {
  let service: LeaveService;

  const repoMockFactory = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  const notificationMock = {
    createNotification: jest.fn(),
  };

  const employeeQbMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  const employeeRepoMock = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(employeeQbMock),
  };

  let reqRepo: any, balanceRepo: any, typeRepo: any, employeeRepo: any;

  const reqQbMock = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    reqRepo = repoMockFactory();
    reqRepo.createQueryBuilder = jest.fn().mockReturnValue(reqQbMock);
    balanceRepo = repoMockFactory();
    typeRepo = repoMockFactory();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        { provide: getRepositoryToken(LeaveRequest), useValue: reqRepo },
        { provide: getRepositoryToken(LeaveBalance), useValue: balanceRepo },
        { provide: getRepositoryToken(LeaveType), useValue: typeRepo },
        { provide: getRepositoryToken(Employee), useValue: employeeRepoMock },
        { provide: NotificationsService, useValue: notificationMock },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
    employeeRepo = module.get(getRepositoryToken(Employee));
    reqQbMock.getOne.mockReset();
    reqQbMock.getOne.mockResolvedValue(null);
    jest.clearAllMocks();
  });

  describe('getLeaveTypes', () => {
    it('should logically reduce duplicates consistently providing unique sets universally mapped purely', async () => {
      typeRepo.find.mockResolvedValue([
        { leave_type_id: 1, name: 'Sick', default_days_allocated: 10 },
        { leave_type_id: 2, name: 'Sick', default_days_allocated: 10 },
        { leave_type_id: 3, name: 'Annual', default_days_allocated: 15 },
      ]);
      const res = await service.getLeaveTypes();
      expect(res.length).toBe(2);
      expect(res[0].name).toBe('Sick');
    });
  });

  describe('getBalance / getMyRequests', () => {
    it('should explicitly aggregate nested balances securely stripping operational overlaps transparently', async () => {
      balanceRepo.find.mockResolvedValue([{ balance_id: 1, leave_type: { name: 'A' }, remaining_days: 5 }]);
      const res = await service.getBalance(1);
      expect(res).toEqual([{ balance_id: 1, leave_type_name: 'A', remaining_days: 5 }]);
    });

    it('should inherently parse admin remarks maintaining identical logic ensuring accurate response structures automatically', async () => {
      reqRepo.find.mockResolvedValue([{ 
        request_id: 1, leave_type: { name: 'A' }, start_date: 'd1', end_date: 'd2', reason: 'r', status: 'Pending', manager_approver: { email: 'e' }, admin_note: 'note' 
      }]);
      const res = await service.getMyRequests(1);
      expect(res.length).toBe(1);
      expect(res[0].admin_note).toBe('note');
    });
  });

  describe('submitRequest', () => {
    it('should explicitly force failure if requested configuration is unlocatable dynamically preserving database integrity gracefully', async () => {
      typeRepo.findOne.mockResolvedValue(null);
      await expect(service.submitRequest(1, 2, 'start', 'end')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if there is an overlapping approved request', async () => {
      typeRepo.findOne.mockResolvedValue({ name: 'Type', leave_type_id: 2 });
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1, first_name: 'F', last_name: 'L' });
      reqQbMock.getOne.mockResolvedValueOnce({ start_date: '2026-05-01', end_date: '2026-05-05' });

      await expect(service.submitRequest(1, 2, '2026-05-02', '2026-05-04', 'Overlap')).rejects.toThrow(BadRequestException);
    });

    it('should accurately compute relational requirements safely aggregating push notifications structurally bypassing isolated loops quietly identically', async () => {
      typeRepo.findOne.mockResolvedValue({ name: 'Type', leave_type_id: 2 });
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1, first_name: 'F', last_name: 'L' });
      reqRepo.create.mockReturnValue({ request_id: 10, status: 'Pending' });
      reqRepo.save.mockResolvedValue({});
      
      employeeQbMock.getMany.mockResolvedValue([{ employee_id: 5 }]);

      const res = await service.submitRequest(1, 2, 'D1', 'D2', 'R');
      
      expect(res.request_id).toBe(10);
      expect(notificationMock.createNotification).toHaveBeenCalled();
    });
  });

  describe('approveLeaveRequest', () => {
    it('should statically lock constraint updates efficiently protecting from unauthorized operations', async () => {
      await expect(service.approveLeaveRequest(1, 'Invalid', 2)).rejects.toThrow(BadRequestException);
    });

    it('should structurally enforce subtraction of consumed allowances strictly binding manager decisions into history natively effectively tracking metadata consistently', async () => {
      reqRepo.findOne.mockResolvedValue({ 
        request_id: 10, start_date: '2026-01-01', end_date: '2026-01-02', 
        employee: { employee_id: 3 }, leave_type: { leave_type_id: 1 }
      });
      employeeRepo.findOne.mockResolvedValue({ employee_id: 2 });
      reqRepo.save.mockImplementation((e: any) => e);
      balanceRepo.findOne.mockResolvedValue({ remaining_days: 5 });
      balanceRepo.save.mockImplementation((e: any) => e);

      const res = await service.approveLeaveRequest(10, 'Approved', 2, 'admin note here');

      expect(res.status).toBe('Approved');
      expect(balanceRepo.save).toHaveBeenCalledWith(expect.objectContaining({ remaining_days: 3 })); // 5 - 2 = 3
      expect(notificationMock.createNotification).toHaveBeenCalledWith(
        3, expect.any(String), expect.stringContaining('admin note here'), expect.any(String)
      );
    });

    it('should allow negative leave balance for Leave in Advance policy', async () => {
      reqRepo.findOne.mockResolvedValue({ 
        request_id: 10, start_date: '2026-01-01', end_date: '2026-01-03', // 3 days
        employee: { employee_id: 3 }, leave_type: { leave_type_id: 1 }
      });
      employeeRepo.findOne.mockResolvedValue({ employee_id: 2 });
      balanceRepo.findOne.mockResolvedValue({ remaining_days: 1 }); // Underflow pending

      await service.approveLeaveRequest(10, 'Approved', 2);

      expect(balanceRepo.save).toHaveBeenCalledWith(expect.objectContaining({ remaining_days: -1 }));
    });
  });
});
