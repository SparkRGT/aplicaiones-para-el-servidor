import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

@Injectable()
export class ReservaService {
  constructor(@InjectRepository(Reserva) private repo: Repository<Reserva>) {}

  create(dto: CreateReservaDto) {
    // Map foreign keys into relation references
    const entity = this.repo.create({
      ...dto,
      cliente: { id_cliente: dto.id_cliente },
      mesa: { id_mesa: dto.id_mesa },
    } as any);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id_reserva: id });
  }

  async update(id: number, dto: UpdateReservaDto) {
    const updateData: any = { ...dto };
    if ((dto as any).id_cliente) updateData.cliente = { id_cliente: (dto as any).id_cliente };
    if ((dto as any).id_mesa) updateData.mesa = { id_mesa: (dto as any).id_mesa };
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
