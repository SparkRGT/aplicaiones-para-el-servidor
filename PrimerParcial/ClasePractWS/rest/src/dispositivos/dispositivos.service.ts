import { Injectable } from '@nestjs/common';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';
import { UpdateDispositivoDto } from './dto/update-dispositivo.dto';

const dispositivos = [
  { id: 1, nombre: 'Dispositivo 1', tipo: 'Tipo A' },
  { id: 2, nombre: 'Dispositivo 2', tipo: 'Tipo B' },
  { id: 3, nombre: 'Dispositivo 3', tipo: 'Tipo A' },
];
@Injectable()
export class DispositivosService {
  create(createDispositivoDto: CreateDispositivoDto) {
    const nuevoDispositivo = { id:(dispositivos.length++).toString(), ...createDispositivoDto };
    dispositivos.push(nuevoDispositivo);
    return ;
  }

  findAll() {
    return `This action returns all dispositivos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dispositivo`;
  }

  update(id: number, updateDispositivoDto: UpdateDispositivoDto) {
    return `This action updates a #${id} dispositivo`;
  }

  remove(id: number) {
    return `This action removes a #${id} dispositivo`;
  }
}
