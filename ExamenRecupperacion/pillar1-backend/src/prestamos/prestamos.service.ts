import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recup_Prestamo } from './entities/recup_prestamo.entity';
import { CreateRecupPrestamoDto } from './dto/create-recup-prestamo.dto';
import { UpdateRecupPrestamoDto } from './dto/update-recup-prestamo.dto';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(Recup_Prestamo)
    private readonly prestamoRepository: Repository<Recup_Prestamo>,
  ) {}

  async create(createPrestamoDto: CreateRecupPrestamoDto): Promise<Recup_Prestamo> {
    const prestamo = this.prestamoRepository.create(createPrestamoDto);
    return await this.prestamoRepository.save(prestamo);
  }

  async findAll(): Promise<Recup_Prestamo[]> {
    return await this.prestamoRepository.find({
      relations: ['lector', 'libro'],
    });
  }

  async findOne(id: number): Promise<Recup_Prestamo> {
    const prestamo = await this.prestamoRepository.findOne({
      where: { prestamoId: id },
      relations: ['lector', 'libro'],
    });
    if (!prestamo) {
      throw new NotFoundException(`Recup_Prestamo con ID ${id} no encontrado`);
    }
    return prestamo;
  }

  async update(id: number, updatePrestamoDto: UpdateRecupPrestamoDto): Promise<Recup_Prestamo> {
    const prestamo = await this.findOne(id);
    Object.assign(prestamo, updatePrestamoDto);
    return await this.prestamoRepository.save(prestamo);
  }

  async remove(id: number): Promise<void> {
    const prestamo = await this.findOne(id);
    await this.prestamoRepository.remove(prestamo);
  }
}
