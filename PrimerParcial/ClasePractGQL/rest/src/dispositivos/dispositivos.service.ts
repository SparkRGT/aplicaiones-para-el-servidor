import { Injectable } from '@nestjs/common';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';
import { UpdateDispositivoDto } from './dto/update-dispositivo.dto';
const dispositivos = [
    { 
      id: '1', 
      nombre: 'Dispositivo A', 
      tipo: 'Tipo 1' 
    },
    { 
      id: '2', 
      nombre: 'Dispositivo B', 
      tipo: 'Tipo 2' 
    },
    { 
      id: '3', 
      nombre: 'Dispositivo C', 
      tipo: 'Tipo 3' 
    },
  ]

@Injectable()
export class DispositivosService {
  
  findAll() {
    return dispositivos;
  }

  findOne(id: string) {
    return dispositivos.find(dispositivo => dispositivo.id === id);
  }
  create(input: { nombre: string; tipo: string }) {
    const id = (dispositivos.length + 1).toString();
    const nuevo = { id, ...input };
    dispositivos.push(nuevo);
    return nuevo;
  }

  update(id: string, input: { nombre?: string; tipo?: string }) {
    const idx = dispositivos.findIndex(d => d.id === id);
    if (idx === -1) return null;
    dispositivos[idx] = { ...dispositivos[idx], ...input };
    return dispositivos[idx];
  }

  remove(id: string) {
    const idx = dispositivos.findIndex(d => d.id === id);
    if (idx === -1) return null;
    const [removed] = dispositivos.splice(idx, 1);
    return removed;
  }
}
