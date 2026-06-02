import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from '../../entities/comment.entity';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { ResignationRequest } from '../../entities/resignation-request.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';
import { NotFoundException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;

  const repoMockFactory = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  });

  const notificationMock = {
    createNotification: jest.fn(),
  };

  let commentRepo: any, leaveRepo: any, resignationRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useFactory: repoMockFactory },
        { provide: getRepositoryToken(LeaveRequest), useFactory: repoMockFactory },
        { provide: getRepositoryToken(ResignationRequest), useFactory: repoMockFactory },
        { provide: NotificationsService, useValue: notificationMock },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepo = module.get(getRepositoryToken(Comment));
    leaveRepo = module.get(getRepositoryToken(LeaveRequest));
    resignationRepo = module.get(getRepositoryToken(ResignationRequest));
    jest.clearAllMocks();
  });

  describe('create', () => {
    // [TC_BE_COMMEN_089]
    it('should create comment and notify admin for LeaveRequest if an employee comments', async () => {
      commentRepo.create.mockReturnValue({ authorId: 2 });
      commentRepo.save.mockResolvedValue({ id: '1' });
      leaveRepo.findOne.mockResolvedValue({ request_id: 10, employee: { employee_id: 2 } });
      
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: '1', 
        author: { first_name: 'John', last_name: 'Doe' }
      } as any);

      await service.create(2, 'LEAVE_REQUEST', '10', 'Content');

      expect(notificationMock.createNotification).toHaveBeenCalledWith(
        1, "New Comment", "John Doe commented on the Leave Request discussion.", NotificationType.COMMENT, "/admin/leave-approvals"
      );
    });

    // [TC_BE_COMMEN_090]
    it('should create comment and notify employee for Resignation if admin comments', async () => {
      commentRepo.create.mockReturnValue({ authorId: 1 });
      commentRepo.save.mockResolvedValue({ id: '1' });
      resignationRepo.findOne.mockResolvedValue({ id: 20, employee: { employee_id: 5 } });
      
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: '1', 
        author: { first_name: 'Admin', last_name: 'User' }
      } as any);

      await service.create(1, 'RESIGNATION', '20', 'Content');

      expect(notificationMock.createNotification).toHaveBeenCalledWith(
        5, "New Comment", "Admin User commented on the Resignation discussion.", NotificationType.COMMENT, "/my-resignation"
      );
    });

    // [TC_BE_COMMEN_091]
    it('should catch error quietly if notification fails', async () => {
      commentRepo.create.mockReturnValue({ authorId: 1 });
      commentRepo.save.mockResolvedValue({ id: '1' });
      leaveRepo.findOne.mockRejectedValue(new Error('DB Error'));
      
      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      await service.create(1, 'LEAVE_REQUEST', '10', 'Content');

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('findByEntity', () => {
    // [TC_BE_COMMEN_092]
    it('should find comments arranged by entity type and ID', async () => {
      commentRepo.find.mockResolvedValue([]);
      expect(await service.findByEntity('T', 'E')).toEqual([]);
      expect(commentRepo.find).toHaveBeenCalledWith({
        where: { entityType: 'T', entityId: 'E' },
        relations: ['author'],
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    // [TC_BE_COMMEN_093]
    it('should return comment if found', async () => {
      commentRepo.findOne.mockResolvedValue({ id: '1' });
      expect(await service.findOne('1')).toEqual({ id: '1' });
    });

    // [TC_BE_COMMEN_094]
    it('should throw NotFoundException if comment is not found', async () => {
      commentRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
