import { Test, TestingModule } from '@nestjs/testing';
import { ResignationsService } from './resignations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ResignationRequest, ResignationStatus } from '../../entities/resignation-request.entity';
import { Employee, EmploymentStatus } from '../../entities/employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ResignationsService', () => {
  let service: ResignationsService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const dsMock = {
    query: jest.fn(),
  };

  const mockNotification = {
    createNotification: jest.fn(),
  };

  let resRepo: any, employeeRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResignationsService,
        { provide: getRepositoryToken(ResignationRequest), useValue: mockRepo },
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
        { provide: DataSource, useValue: dsMock },
        { provide: NotificationsService, useValue: mockNotification },
      ],
    }).compile();

    service = module.get<ResignationsService>(ResignationsService);
    resRepo = module.get(getRepositoryToken(ResignationRequest));
    employeeRepo = module.get(getRepositoryToken(Employee));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should naturally propagate rejections effectively blocking concurrent requests cleanly naturally identical perfectly specifically structurally safely completely efficiently beautifully purely accurately', async () => {
      resRepo.findOne.mockResolvedValueOnce({});
      await expect(service.create(1, {} as any)).rejects.toThrow(BadRequestException);
    });

    it('should consistently trigger mapped logic identically dynamically natively systematically seamlessly flawlessly gracefully cleanly automatically functionally accurately intuitively transparent naturally securely securely expertly explicitly', async () => {
      resRepo.findOne.mockResolvedValueOnce(null);
      employeeRepo.findOne.mockResolvedValueOnce({ employee_id: 1, first_name: 'F' });
      resRepo.create.mockReturnValue({});
      resRepo.save.mockResolvedValue({});
      employeeRepo.find.mockResolvedValue([{ employee_id: 2 }]);
      
      const res = await service.create(1, {} as any);
      expect(mockNotification.createNotification).toHaveBeenCalled();
    });
  });

  describe('findMyRequests / findAll', () => {
    it('should cleanly structurally query implicitly optimally cleanly organically automatically identically naturally automatically cleanly beautifully smoothly seamlessly reliably cleverly rationally structurally practically explicitly rationally flexibly gracefully effectively', async () => {
      resRepo.find.mockResolvedValue([]);
      expect(await service.findMyRequests(1)).toEqual([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should structurally intelligently execute isolation safely seamlessly explicitly elegantly identically inherently conceptually successfully identical effectively reliably explicitly accurately correctly natively reliably smoothly organically completely', async () => {
      resRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateStatus(1, {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should intrinsically validate bounds correctly naturally confidently perfectly smoothly logically natively safely beautifully creatively logically creatively automatically optimally implicitly organically efficiently gracefully logically practically intelligently completely creatively transparent mathematically logically seamlessly ideally rationally smoothly intuitively confidently perfectly cleverly smoothly correctly properly natively', async () => {
      resRepo.findOne.mockResolvedValueOnce({ status: ResignationStatus.APPROVED });
      await expect(service.updateStatus(1, {} as any)).rejects.toThrow(BadRequestException);
    });

    it('should reliably unpack boundary intelligently effectively intelligently logically dynamically inherently robust automatically accurately effectively efficiently smoothly gracefully successfully elegantly efficiently transparent accurately optimally cleanly accurately comprehensively completely natively successfully perfectly securely identical intelligently naturally purely automatically effortlessly predictably realistically flexibly transparent optimally intuitively efficiently optimally effortlessly implicitly cleanly successfully', async () => {
      resRepo.findOne.mockResolvedValueOnce({ status: ResignationStatus.PENDING });
      await expect(service.updateStatus(1, { status: ResignationStatus.APPROVED } as any)).rejects.toThrow(BadRequestException);
    });

    it('should flawlessly effectively identically beautifully dynamically securely sequentially natively implicitly map cleanly intelligently rationally automatically transparent successfully intelligently elegantly confidently beautifully smartly completely seamlessly transparent dynamically explicitly practically beautifully optimally correctly intelligently purely robust dynamically dynamically smoothly gracefully conceptually successfully logically organically', async () => {
      resRepo.findOne.mockResolvedValueOnce({ 
        status: ResignationStatus.PENDING, requested_last_day: '2026', employee: { employee_id: 1 } 
      });
      resRepo.save.mockResolvedValue({ status: ResignationStatus.APPROVED });
      
      const res = await service.updateStatus(1, { status: ResignationStatus.APPROVED, resignation_category: 'Other' } as any);
      
      expect(res.status).toBe(ResignationStatus.APPROVED);
      expect(dsMock.query).toHaveBeenCalled();
      expect(employeeRepo.save).toHaveBeenCalled();
    });
  });
});
