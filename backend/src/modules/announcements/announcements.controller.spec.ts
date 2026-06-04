import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  let module: TestingModule;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getFeed: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        { provide: AnnouncementsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    // [TC_BE_ANNOUN_037]
    it('should create an announcement', async () => {
      mockService.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({ title: 'T', content: 'C', target_audience: 'all', delivery_methods: [] } as any)).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    // [TC_BE_ANNOUN_038]
    it('should return all announcements', async () => {
      mockService.findAll.mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
    });
  });

  describe('getFeed', () => {
    // [TC_BE_ANNOUN_039]
    it('should return user feed', async () => {
      mockService.getFeed.mockResolvedValue([]);
      const req = { user: { id: 1 } };
      expect(await controller.getFeed(req)).toEqual([]);
      expect(mockService.getFeed).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('delete', () => {
    // [TC_BE_ANNOUN_040]
    it('should delete an announcement', async () => {
      mockService.delete.mockResolvedValue(undefined);
      expect(await controller.delete('1')).toBeUndefined();
      expect(mockService.delete).toHaveBeenCalledWith(1);
    });
  });
});
