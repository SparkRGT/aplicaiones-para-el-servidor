import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Recup_Prestamo } from './entities/recup_prestamo.entity';
import { CreateRecupPrestamoDto } from './dto/create-recup-prestamo.dto';
import { UpdateRecupPrestamoDto } from './dto/update-recup-prestamo.dto';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(Recup_Prestamo)
    private readonly prestamoRepository: Repository<Recup_Prestamo>,
    @Inject('AUDIT_SERVICE')
    private readonly auditClient: ClientProxy,
  ) {}

  async create(createPrestamoDto: CreateRecupPrestamoDto): Promise<Recup_Prestamo> {
    const prestamo = this.prestamoRepository.create(createPrestamoDto);
    const saved = await this.prestamoRepository.save(prestamo);

    // Emitir evento de creación (estado inicial)
    this.auditClient.emit('recup_prestamo.estado.cambiado', {
      prestamoId: saved.prestamoId,
      estadoAnterior: null,
      estadoNuevo: saved.recup_estado || 'SOLICITADO',
      fechaCambio: new Date(),
      comentario: 'Préstamo creado',
    });

    return saved;
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
    const estadoAnterior = prestamo.recup_estado;

    Object.assign(prestamo, updatePrestamoDto);
    const updated = await this.prestamoRepository.save(prestamo);

    // Emitir evento si el estado cambió
    if (updatePrestamoDto.recup_estado && estadoAnterior !== updatePrestamoDto.recup_estado) {
      this.auditClient.emit('recup_prestamo.estado.cambiado', {
        prestamoId: updated.prestamoId,
        estadoAnterior: estadoAnterior,
        estadoNuevo: updatePrestamoDto.recup_estado,
        fechaCambio: new Date(),
        comentario: `Estado cambiado de ${estadoAnterior} a ${updatePrestamoDto.recup_estado}`,
      });
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const prestamo = await this.findOne(id);
    await this.prestamoRepository.remove(prestamo);
  }
}
