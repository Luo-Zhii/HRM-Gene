import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contract, ContractStatus } from '../../entities/contract.entity';
import { Employee } from '../../entities/employee.entity';
import { SalaryHistory } from '../../entities/salary-history.entity';
import { SalaryConfig } from '../../entities/salary-config.entity';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ContractsService', () => {
  let service: ContractsService;

  let qbInstance: any;

  const createQueryBuilderMock = () => {
    if (!qbInstance) {
      qbInstance = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
    }
    return qbInstance;
  };

  const repoMockFactory = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockImplementation(createQueryBuilderMock),
  });

  let contractRepo: any, employeeRepo: any, salaryHistoryRepo: any, salaryConfigRepo: any;

  beforeEach(async () => {
    qbInstance = null;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: getRepositoryToken(Contract), useFactory: repoMockFactory },
        { provide: getRepositoryToken(Employee), useFactory: repoMockFactory },
        { provide: getRepositoryToken(SalaryHistory), useFactory: repoMockFactory },
        { provide: getRepositoryToken(SalaryConfig), useFactory: repoMockFactory },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    contractRepo = module.get(getRepositoryToken(Contract));
    employeeRepo = module.get(getRepositoryToken(Employee));
    salaryHistoryRepo = module.get(getRepositoryToken(SalaryHistory));
    salaryConfigRepo = module.get(getRepositoryToken(SalaryConfig));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should safely throw NotFoundException if linked employee does not exist', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ employee_id: 1 } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException uniformly if targeted contract sequence already exists', async () => {
      employeeRepo.findOne.mockResolvedValue({});
      contractRepo.findOne.mockResolvedValue({});
      await expect(service.create({ employee_id: 1, contract_number: 'C1' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should safely create contract, automatically de-activate other overlapping active states, and record subsequent salary transitions accurately', async () => {
      employeeRepo.findOne.mockResolvedValue({ employee_id: 1 });
      contractRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ contract_id: 10 }); 
      salaryConfigRepo.findOne.mockResolvedValue({ base_salary: '1000' });
      contractRepo.create.mockReturnValue({ status: ContractStatus.ACTIVE });
      contractRepo.save.mockResolvedValue({ contract_id: 10 });

      await service.create({ employee_id: 1, contract_number: 'C1', status: ContractStatus.ACTIVE, salary_rate: '2000' } as any);

      expect(contractRepo.update).toHaveBeenCalledWith(
        { employee: { employee_id: 1 }, status: ContractStatus.ACTIVE },
        { status: ContractStatus.EXPIRED }
      );
      expect(salaryHistoryRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should properly configure pagination constraints alongside query builder conditional constraints', async () => {
      const qb = contractRepo.createQueryBuilder();
      const result = await service.findAll(1, 1, 10, 'search', 'Active', 'Official');
      
      expect(qb.andWhere).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ employeeId: 1 }));
      expect(qb.getManyAndCount).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });
  });

  describe('findByEmployee', () => {
    it('should locate and sort contract listing for an individual employee strictly', async () => {
      contractRepo.find.mockResolvedValue([]);
      expect(await service.findByEmployee(1)).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should natively catch internal rejection when entity fails to locate matching record pattern', async () => {
      contractRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should structurally return single occurrence adhering directly to input query requirements', async () => {
      contractRepo.findOne.mockResolvedValue({ contract_id: 1 });
      expect(await service.findOne(1, 2)).toEqual({ contract_id: 1 });
      expect(contractRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { contract_id: 1, employee: { employee_id: 2 } } }));
    });
  });

  describe('update', () => {
    it('should dynamically map parameter shifts, auto-expire older configurations and record salary deltas implicitly', async () => {
      const contract = { employee: { employee_id: 1 }, contract_id: 1, contract_number: 'C1', status: ContractStatus.EXPIRED, salary_rate: '1000' };
      contractRepo.findOne.mockResolvedValue(contract);
      contractRepo.save.mockResolvedValue(contract);
      
      await service.update(1, { status: ContractStatus.ACTIVE, salary_rate: '1500' });

      expect(salaryHistoryRepo.create).toHaveBeenCalled();
      expect(contractRepo.update).toHaveBeenCalledWith(
        { employee: { employee_id: 1 }, status: ContractStatus.ACTIVE },
        { status: ContractStatus.EXPIRED }
      );
    });
  });

  describe('remove', () => {
    it('should bridge lookup constraints to deletion framework transparently avoiding retention', async () => {
      contractRepo.findOne.mockResolvedValue({ contract_id: 1 });
      contractRepo.remove.mockResolvedValue({});
      expect(await service.remove(1)).toEqual({ message: 'Contract deleted successfully' });
      expect(contractRepo.remove).toHaveBeenCalled();
    });
  });
});
