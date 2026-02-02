import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecupHistorialPrestamo } from './entities';
import { CreateHistorialPrestamoDto } from './dto';

@Injectable()
export class HistorialPrestamoService {
  constructor(
    @InjectRepository(RecupHistorialPrestamo)
    private readonly historialRepository: Repository<RecupHistorialPrestamo>,
  ) {}

  async registrarCambioEstado(
    dto: CreateHistorialPrestamoDto,
  ): Promise<RecupHistorialPrestamo> {
    const historial = this.historialRepository.create({
      recup_prestamoId: dto.prestamoId,
      recup_estadoAnterior: dto.estadoAnterior,
      recup_estadoNuevo: dto.estadoNuevo,
      recup_comentarioCambio: dto.comentario || null,
      recup_fechaCambio: new Date(dto.fechaCambio),
    });

    return await this.historialRepository.save(historial);
  }

  async obtenerHistorialPorPrestamo(
    prestamoId: number,
  ): Promise<RecupHistorialPrestamo[]> {
    return await this.historialRepository.find({
      where: { recup_prestamoId: prestamoId },
      order: { recup_fechaCambio: 'DESC' },
    });
  }

  async obtenerTodoElHistorial(): Promise<RecupHistorialPrestamo[]> {
    return await this.historialRepository.find({
      order: { recup_fechaCambio: 'DESC' },
    });
  }
}
