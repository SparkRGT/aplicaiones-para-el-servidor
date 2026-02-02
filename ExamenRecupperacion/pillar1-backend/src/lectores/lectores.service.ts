import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recup_Lector } from '../prestamos/entities/recup_lector.entity';
import { CreateLectorDto } from './dto/create-lector.dto';
import { UpdateLectorDto } from './dto/update-lector.dto';

@Injectable()
export class LectoresService {
  constructor(
    @InjectRepository(Recup_Lector)
    private readonly lectorRepository: Repository<Recup_Lector>,
  ) {}

  async create(createLectorDto: CreateLectorDto): Promise<Recup_Lector> {
    const lector = this.lectorRepository.create(createLectorDto);
    return await this.lectorRepository.save(lector);
  }

  async findAll(): Promise<Recup_Lector[]> {
    return await this.lectorRepository.find();
  }

  async findOne(id: number): Promise<Recup_Lector> {
    const lector = await this.lectorRepository.findOne({
      where: { lectorId: id },
    });
    if (!lector) {
      throw new NotFoundException(`Lector con ID ${id} no encontrado`);
    }
    return lector;
  }

  async update(id: number, updateLectorDto: UpdateLectorDto): Promise<Recup_Lector> {
    const lector = await this.findOne(id);
    Object.assign(lector, updateLectorDto);
    return await this.lectorRepository.save(lector);
  }

  async remove(id: number): Promise<void> {
    const lector = await this.findOne(id);
    await this.lectorRepository.remove(lector);
  }
}
