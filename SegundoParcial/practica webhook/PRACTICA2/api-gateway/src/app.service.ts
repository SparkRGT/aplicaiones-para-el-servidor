import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  private readonly microservicioAUrl = `http://localhost:${process.env.MICROSERVICIO_A_PORT || 3001}`;

  async crearProducto(producto: any) {
    try {
      const response = await axios.post(
        `${this.microservicioAUrl}/api/productos`,
        producto
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Error al crear producto',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listarProductos() {
    try {
      const response = await axios.get(`${this.microservicioAUrl}/api/productos`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Error al listar productos',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async obtenerProducto(id: string) {
    try {
      const response = await axios.get(`${this.microservicioAUrl}/api/productos/${id}`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Error al obtener producto',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async crearOrden(productoId: string, orden: any) {
    try {
      const response = await axios.post(
        `${this.microservicioAUrl}/api/productos/${productoId}/ordenes`,
        orden
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Error al crear orden',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

