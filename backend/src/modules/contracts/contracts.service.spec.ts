import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contract, ContractStatus } from '../../entities/contract.entity';
import { Employee } from '../../entities/employee.entity';
import { SalaryHistory } from '../../entities/salary-history.entity';
import { SalaryConfig } from '../../entities/salary-config.entity';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

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
        { provide: NotificationsService, useValue: { createNotification: jest.fn() } },
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
    // [TC_BE_CONTRA_113]
    it('create: Ném NotFoundException khi employee_id không tồn tại', async () => {
      employeeRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ employee_id: 1 } as any)).rejects.toThrow(NotFoundException);
    });

    // [TC_BE_CONTRA_114]
    it('create: Ném BadRequestException khi contract_number đã tồn tại', async () => {
      employeeRepo.findOne.mockResolvedValue({});
      contractRepo.findOne.mockResolvedValue({});
      await expect(service.create({ employee_id: 1, contract_number: 'C1' } as any)).rejects.toThrow(BadRequestException);
    });

    // [TC_BE_CONTRA_115]
    it('Tạo hợp đồng lao động mới cho nhân viên',
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
    // [TC_BE_CONTRA_116]
    it('findAll: Cấu hình phân trang và filter với query builder', async () => {
      const qb = contractRepo.createQueryBuilder();
      const result = await service.findAll(1, 1, 10, 'search', 'Active', 'Official');
      
      expect(qb.andWhere).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ employeeId: 1 }));
      expect(qb.getManyAndCount).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });
  });

  describe('findByEmployee', () => {
    // [TC_BE_CONTRA_117]
    it('findByEmployee: Lấy danh sách hợp đồng của một nhân viên', async () => {
      contractRepo.find.mockResolvedValue([]);
      expect(await service.findByEmployee(1)).toEqual([]);
    });
  });

  describe('findOne', () => {
    // [TC_BE_CONTRA_118]
    it('findOne: Ném NotFoundException khi không tìm thấy hợp đồng', async () => {
      contractRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    // [TC_BE_CONTRA_119]
    it('findOne: Trả về hợp đồng theo contract_id và employee_id', async () => {
      contractRepo.findOne.mockResolvedValue({ contract_id: 1 });
      expect(await service.findOne(1, 2)).toEqual({ contract_id: 1 });
      expect(contractRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { contract_id: 1, employee: { employee_id: 2 } } }));
    });
  });

  describe('update', () => {
    // [TC_BE_CONTRA_120]
    it('update: Cập nhật hợp đồng, tự động expire hợp đồng cũ và ghi lịch sử lương', async () => {
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
    // [TC_BE_CONTRA_121]
    it('remove: Xóa hợp đồng thành công và trả về message', async () => {
      contractRepo.findOne.mockResolvedValue({ contract_id: 1, employee: { employee_id: 1 }, contract_number: 'C1' });
      contractRepo.remove.mockResolvedValue({});
      expect(await service.remove(1)).toEqual({ message: 'Contract deleted successfully' });
      expect(contractRepo.remove).toHaveBeenCalled();
    });
  });
});
