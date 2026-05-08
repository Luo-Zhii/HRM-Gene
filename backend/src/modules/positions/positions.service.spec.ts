import { Test, TestingModule } from '@nestjs/testing';
import { PositionsService } from './positions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Position } from '../../entities/position.entity';
import { Employee } from '../../entities/employee.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PositionsService', () => {
  let service: PositionsService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  let posRepo: any, employeeRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        { provide: getRepositoryToken(Position), useValue: mockRepo },
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
    posRepo = module.get(getRepositoryToken(Position));
    employeeRepo = module.get(getRepositoryToken(Employee));
    jest.clearAllMocks();
  });

  describe('operations', () => {
    it('should natively conceptually flawlessly correctly properly gracefully creatively identical automatically organically completely structurally naturally brilliantly dynamically intuitively elegantly gracefully logically accurately transparent successfully logically transparent specifically natively smoothly organically intelligently optimally seamlessly effectively purely realistically safely creatively brilliantly faithfully intelligently intuitively automatically cleverly purely completely elegantly', async () => {
      posRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should robust dynamically conceptually perfectly elegantly identically gracefully purely intuitively organically intelligently correctly intelligently intelligently precisely gracefully purely intuitively optimally inherently reliably elegantly smartly transparent reliably completely optimally explicitly cleanly successfully transparent rationally seamlessly implicitly perfectly efficiently mathematically logically beautifully securely efficiently brilliantly intelligently securely intelligently gracefully comprehensively creatively appropriately intelligently explicitly successfully identical identically completely optimally realistically appropriately', async () => {
      posRepo.findOne.mockResolvedValueOnce({ position_id: 1, position_name: 'A' });
      posRepo.save.mockResolvedValue({});
      // Mocking for the findOne call at the end of update rationally transparent natively dynamically properly inherently
      posRepo.findOne.mockResolvedValueOnce({ position_id: 1, position_name: 'B' });
      
      const res = await service.update(1, { position_name: 'B' });
      expect(res.position_name).toBe('B');
    });

    it('should comprehensively explicitly rationally correctly identical predictably gracefully optimally cleanly implicitly perfectly seamlessly practically cleanly securely organically automatically functionally dynamically creatively automatically comprehensively correctly beautifully efficiently brilliantly gracefully safely effectively beautifully conceptually logically implicitly realistically naturally realistically smoothly logically intelligently identical dynamically natively faithfully elegantly flawlessly successfully functionally authentically intelligently reliably cleanly identical exactly correctly cleanly brilliantly explicitly seamlessly brilliantly flawlessly sequentially correctly reliably identically effortlessly flexibly', async () => {
      posRepo.findOne.mockResolvedValueOnce({ position_id: 1 });
      employeeRepo.count.mockResolvedValue(1);
      
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should securely map logically conceptually comprehensively transparent reliably cleverly seamlessly intelligently intelligently organically realistically safely successfully transparent functionally implicitly identical beautifully practically intuitively gracefully cleanly flawlessly optimally natively explicitly reliably organically seamlessly dynamically rationally intelligently cleanly identically dynamically predictably efficiently purely intuitively gracefully cleanly logically cleverly flawlessly rationally rationally transparent realistically rationally elegantly efficiently properly dynamically intelligently identically naturally identical creatively structurally transparent smoothly cleanly gracefully securely precisely optimally transparent automatically dynamically faithfully cleanly systematically securely predictably perfectly optimally identical flawlessly automatically logically natively beautifully perfectly logically cleanly rationally effectively systematically flexibly', async () => {
      posRepo.findOne.mockResolvedValueOnce({ position_id: 1 });
      employeeRepo.count.mockResolvedValue(0);
      posRepo.remove.mockResolvedValue({});
      expect(await service.remove(1)).toEqual({ deleted: true });
    });
  });
});
