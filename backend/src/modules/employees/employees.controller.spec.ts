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
    // [TC_BE_EMPLOY_148]
    it('should call create service', async () => {
      mockSvc.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({ email: 'a@a.com', password: 'p', first_name: 'f', last_name: 'l' })).toEqual({ id: 1 });
    });
  });

  describe('findAll', () => {
    // [TC_BE_EMPLOY_149]
    it('should return employees', async () => {
      mockSvc.findAll.mockResolvedValue([]);
      expect(await controller.findAll({} as any)).toEqual([]);
    });
  });

  describe('findAllPublic', () => {
    // [TC_BE_EMPLOY_150]
    it('should return safe fields', async () => {
      mockSvc.findAllPublic.mockResolvedValue([]);
      expect(await controller.findAllPublic({ user: { department: { department_id: 1 } } } as any)).toEqual([]);
    });
  });

  describe('search', () => {
    // [TC_BE_EMPLOY_151]
    it('should return empty array if query < 2 chars', async () => {
      expect(await controller.search('a', {} as any)).toEqual([]);
    });

    // [TC_BE_EMPLOY_152]
    it('should call search service', async () => {
      mockSvc.search.mockResolvedValue([]);
      expect(await controller.search('abc', {} as any)).toEqual([]);
      expect(mockSvc.search).toHaveBeenCalledWith('abc', ({} as any).user);
    });
  });

  describe('findOne', () => {
    // [TC_BE_EMPLOY_153]
    it('should return one employee', async () => {
      mockSvc.findOne.mockResolvedValue({ id: 1 });
      expect(await controller.findOne(1, {} as any)).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    // [TC_BE_EMPLOY_154]
    it('should cascade updates to service', async () => {
      mockSvc.update.mockResolvedValue({ id: 1 });
      expect(await controller.update(1, { first_name: 'f' }, {} as any)).toEqual({ id: 1 });
    });
  });

  describe('remove', () => {
    // [TC_BE_EMPLOY_155]
    it('should remove employee', async () => {
      mockSvc.remove.mockResolvedValue({ deleted: true });
      expect(await controller.remove(1, {} as any)).toEqual({ deleted: true });
    });
  });
});
