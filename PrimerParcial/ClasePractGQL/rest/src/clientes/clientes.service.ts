import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
const clientes = [
    { 
      id: '1', 
      nombre: 'Cliente A', 
      correo: 'user@mail',
    },
    {
      id: '2', 
      nombre: 'Cliente B', 
      correo: 'user@mail',
    },
    {
      id: '3', 
      nombre: 'Cliente C', 
      correo: 'user@mail',
    }
  ]
    
@Injectable()
export class ClientesService {
  

  findAll() {
    return clientes;
  }

  findOne(id: string) {
    return clientes.find(cliente=>cliente.id ===id);
  }

  create(input: { nombre: string; correo: string }) {
    const id = (clientes.length + 1).toString();
    const nuevo = { id, ...input };
    clientes.push(nuevo);
    return nuevo;
  }

  update(id: string, input: { nombre?: string; correo?: string }) {
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    clientes[idx] = { ...clientes[idx], ...input };
    return clientes[idx];
  }

  remove(id: string) {
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const [removed] = clientes.splice(idx, 1);
    return removed;
  }
}
