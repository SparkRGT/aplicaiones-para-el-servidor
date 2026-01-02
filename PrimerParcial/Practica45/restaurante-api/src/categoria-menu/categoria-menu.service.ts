import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaMenu } from './entities/categoria-menu.entity';
import { CreateCategoriaMenuDto } from './dto/create-categoria-menu.dto';
import { UpdateCategoriaMenuDto } from './dto/update-categoria-menu.dto';

@Injectable()
export class CategoriaMenuService {
  constructor(
    @InjectRepository(CategoriaMenu)
    private repo: Repository<CategoriaMenu>,
  ) {}

  create(dto: CreateCategoriaMenuDto) {
    const nueva = this.repo.create(dto);
    return this.repo.save(nueva);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id_categoria: id });
  }

  async update(id: number, dto: UpdateCategoriaMenuDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
