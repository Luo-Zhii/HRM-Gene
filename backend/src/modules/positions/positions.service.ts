import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Position } from "../../entities/position.entity";
import { CreatePositionDto } from "./dto/create-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly posRepo: Repository<Position>
  ) {}

  async create(dto: CreatePositionDto) {
    const pos = this.posRepo.create({
      position_name: dto.position_name,
    } as any);
    return this.posRepo.save(pos);
  }

  findAll() {
    return this.posRepo.find();
  }

  async findOne(id: number) {
    const pos = await this.posRepo.findOne({
      where: { position_id: id } as any,
    });
    if (!pos) throw new NotFoundException("Position not found");
    return pos;
  }

  async update(id: number, dto: UpdatePositionDto) {
    const pos = await this.posRepo.findOne({
      where: { position_id: id } as any,
    });
    if (!pos) throw new NotFoundException("Position not found");

    if (dto.position_name !== undefined) pos.position_name = dto.position_name;

    await this.posRepo.save(pos as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    const pos = await this.posRepo.findOne({
      where: { position_id: id } as any,
    });
    if (!pos) throw new NotFoundException("Position not found");
    await this.posRepo.remove(pos);
    return { deleted: true };
  }
}
