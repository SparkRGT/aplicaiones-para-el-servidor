import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RestService {
  private baseUrl = 'http://localhost:3001'; // URL de tu servicio REST (Taller 4)

  constructor(private readonly http: HttpService) {}

  async getProductos() {
    const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/productos`));
    return data;
  }

  async getProveedores() {
    const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/proveedores`));
    return data;
  }

  async getCategorias() {
    const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/categorias`));
    return data;
  }

  // Puedes añadir más métodos según tus endpoints REST
}
