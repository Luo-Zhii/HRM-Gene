import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const mockSvc = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllPublic: jest.fn(),
    search: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: mockSvc },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create service', async () => {
      mockSvc.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({ email: 'a@a.com', password: 'p', first_name: 'f', last_name: 'l' })).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    it('should return employees', async () => {
      mockSvc.findAll.mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
    });
  });

  describe('findAllPublic', () => {
    it('should return safe fields', async () => {
      mockSvc.findAllPublic.mockResolvedValue([]);
      expect(await controller.findAllPublic({ user: { department: { department_id: 1 } } } as any)).toEqual([]);
    });
  });

  describe('search', () => {
    it('should return empty array if query < 2 chars', async () => {
      expect(await controller.search('a')).toEqual([]);
    });

    it('should call search service', async () => {
      mockSvc.search.mockResolvedValue([]);
      expect(await controller.search('abc')).toEqual([]);
      expect(mockSvc.search).toHaveBeenCalledWith('abc');
    });
  });

  describe('findOne', () => {
    it('should return one employee', async () => {
      mockSvc.findOne.mockResolvedValue({ id: 1 });
      expect(await controller.findOne(1)).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('should cascade updates to service', async () => {
      mockSvc.update.mockResolvedValue({ id: 1 });
      expect(await controller.update(1, { first_name: 'f' })).toEqual({ id: 1 });
    });
  });

  describe('remove', () => {
    it('should remove employee', async () => {
      mockSvc.remove.mockResolvedValue({ deleted: true });
      expect(await controller.remove(1)).toEqual({ deleted: true });
    });
  });
});
