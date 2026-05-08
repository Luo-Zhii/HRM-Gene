import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;

  const mockService = {
    create: jest.fn(),
    findByEntity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CommentsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should extract author id from token and create a comment via service', async () => {
      mockService.create.mockResolvedValue({ id: '1' });
      const req = { user: { employee_id: 2 } };
      const body = { entityType: 'LEAVE', entityId: 'E', content: 'C' };
      
      const result = await controller.create(req, body);
      
      expect(result).toEqual({ id: '1' });
      expect(mockService.create).toHaveBeenCalledWith(2, 'LEAVE', 'E', 'C');
    });
  });

  describe('findByEntity', () => {
    it('should find comments by entity via service', async () => {
      mockService.findByEntity.mockResolvedValue([]);
      
      const result = await controller.findByEntity('LEAVE', 'E');
      
      expect(result).toEqual([]);
      expect(mockService.findByEntity).toHaveBeenCalledWith('LEAVE', 'E');
    });
  });
});
