import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recup_Libro } from '../prestamos/entities/recup_libro.entity';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';

@Injectable()
export class LibrosService {
  constructor(
    @InjectRepository(Recup_Libro)
    private readonly libroRepository: Repository<Recup_Libro>,
  ) {}

  async create(createLibroDto: CreateLibroDto): Promise<Recup_Libro> {
    const libro = this.libroRepository.create(createLibroDto);
    return await this.libroRepository.save(libro);
  }

  async findAll(): Promise<Recup_Libro[]> {
    return await this.libroRepository.find();
  }

  async findOne(id: number): Promise<Recup_Libro> {
    const libro = await this.libroRepository.findOne({
      where: { libroId: id },
    });
    if (!libro) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return libro;
  }

  async update(id: number, updateLibroDto: UpdateLibroDto): Promise<Recup_Libro> {
    const libro = await this.findOne(id);
    Object.assign(libro, updateLibroDto);
    return await this.libroRepository.save(libro);
  }

  async remove(id: number): Promise<void> {
    const libro = await this.findOne(id);
    await this.libroRepository.remove(libro);
  }
}
