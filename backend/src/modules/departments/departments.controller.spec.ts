import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let module: TestingModule;

  const mockSvc = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        { provide: DepartmentsService, useValue: mockSvc },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    // [TC_BE_DEPART_134]
    it('should create and return department', async () => {
      mockSvc.create.mockResolvedValue({ id: 1 });
      expect(await controller.create({ department_name: 'HR' })).toEqual({ id: 1 });
      expect(mockSvc.create).toHaveBeenCalledWith({ department_name: 'HR' });
    });
  });

  describe('findAll', () => {
    // [TC_BE_DEPART_135]
    it('should return array of departments', async () => {
      mockSvc.findAll.mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
    });
  });

  describe('findOne', () => {
    // [TC_BE_DEPART_136]
    it('should return department', async () => {
      mockSvc.findOne.mockResolvedValue({ id: 1 });
      expect(await controller.findOne(1)).toEqual({ id: 1 });
      expect(mockSvc.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    // [TC_BE_DEPART_137]
    it('should return updated department', async () => {
      mockSvc.update.mockResolvedValue({ id: 1 });
      expect(await controller.update(1, { department_name: 'IT' })).toEqual({ id: 1 });
      expect(mockSvc.update).toHaveBeenCalledWith(1, { department_name: 'IT' });
    });
  });

  describe('remove', () => {
    // [TC_BE_DEPART_138]
    it('should remove department', async () => {
      mockSvc.remove.mockResolvedValue({ deleted: true });
      expect(await controller.remove(1)).toEqual({ deleted: true });
      expect(mockSvc.remove).toHaveBeenCalledWith(1);
    });
  });
});
