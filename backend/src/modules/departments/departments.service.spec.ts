import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Department } from '../../entities/department.entity';
import { Employee } from '../../entities/employee.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  const mockDeptRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    }),
  };

  const mockEmployeeRepo = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: getRepositoryToken(Department), useValue: mockDeptRepo },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    // [TC_BE_DEPART_139]
    it('should create and save a new department', async () => {
      mockDeptRepo.create.mockReturnValue({ department_name: 'IT' });
      mockDeptRepo.save.mockResolvedValue({ id: 1, department_name: 'IT' });

      const result = await service.create({ department_name: 'IT' } as any);
      expect(result).toEqual({ id: 1, department_name: 'IT' });
      expect(mockDeptRepo.create).toHaveBeenCalledWith({ department_name: 'IT' });
    });
  });

  describe('findAll', () => {
    // [TC_BE_DEPART_140]
    it('should return array of departments', async () => {
      mockDeptRepo.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('findOne', () => {
    // [TC_BE_DEPART_141]
    it('should throw NotFoundException if not found', async () => {
      mockDeptRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    // [TC_BE_DEPART_142]
    it('should return department', async () => {
      mockDeptRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    // [TC_BE_DEPART_143]
    it('should throw NotFoundException if not found', async () => {
      mockDeptRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
    });

    // [TC_BE_DEPART_144]
    it('should update department name correctly', async () => {
      const dept = { department_id: 1, department_name: 'Old' };
      mockDeptRepo.findOne.mockResolvedValue(dept);
      mockDeptRepo.save.mockResolvedValue({ ...dept, department_name: 'New' });

      await service.update(1, { department_name: 'New' });
      expect(mockDeptRepo.save).toHaveBeenCalledWith(expect.objectContaining({ department_name: 'New' }));
    });
  });

  describe('remove', () => {
    // [TC_BE_DEPART_145]
    it('should throw NotFoundException if not found', async () => {
      mockDeptRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    // [TC_BE_DEPART_146]
    it('should throw BadRequestException if employees are assigned', async () => {
      mockDeptRepo.findOne.mockResolvedValue({ department_id: 1 });
      mockEmployeeRepo.count.mockResolvedValue(1);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    // [TC_BE_DEPART_147]
    it('should remove department and return deleted: true', async () => {
      mockDeptRepo.findOne.mockResolvedValue({ department_id: 1 });
      mockEmployeeRepo.count.mockResolvedValue(0);

      const result = await service.remove(1);
      expect(mockDeptRepo.remove).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });
});
