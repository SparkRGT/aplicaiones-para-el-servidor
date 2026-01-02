import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilaVirtual } from './entities/fila-virtual.entity';
import { CreateFilaVirtualDto } from './dto/create-fila-virtual.dto';
import { UpdateFilaVirtualDto } from './dto/update-fila-virtual.dto';

@Injectable()
export class FilaVirtualService {
  constructor(@InjectRepository(FilaVirtual) private repo: Repository<FilaVirtual>) {}

  create(dto: CreateFilaVirtualDto) {
    const entity = this.repo.create({
      ...dto,
      cliente: { id_cliente: (dto as any).id_cliente },
    } as any);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id_fila: id });
  }

  async update(id: number, dto: UpdateFilaVirtualDto) {
    const updateData: any = { ...dto };
    if ((dto as any).id_cliente) updateData.cliente = { id_cliente: (dto as any).id_cliente };
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
