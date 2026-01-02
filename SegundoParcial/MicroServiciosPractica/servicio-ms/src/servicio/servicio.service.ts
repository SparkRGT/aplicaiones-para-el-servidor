import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './servicio.entity';

@Injectable()
export class ServicioService {
  constructor(
    @InjectRepository(Servicio)
    private repo: Repository<Servicio>,
  ) {}

  async existeServicio(id: number): Promise<boolean> {
    const count = await this.repo.count({ where: { id } });
    return count > 0;
  }

  async crearServicio(data: Partial<Servicio>) {
    // Validar que nombre_servicio está presente
    if (!data.nombre_servicio) {
      throw new BadRequestException('El campo nombre_servicio es obligatorio');
    }

    const servicio = this.repo.create(data);
    return this.repo.save(servicio);
  }

  async obtenerServicios() {
    return this.repo.find();
  }

  async obtenerServicioPorId(id: number) {
    return this.repo.findOne({ where: { id } });
  }

}
