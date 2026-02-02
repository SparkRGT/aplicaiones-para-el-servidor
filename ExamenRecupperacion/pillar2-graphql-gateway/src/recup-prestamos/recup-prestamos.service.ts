import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RecupPrestamo, RecupPrestamosVencidosReport } from './object-types';

@Injectable()
export class RecupPrestamosService {
  private readonly pillar1BaseUrl = process.env.PILLAR1_URL || 'http://localhost:3000';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene todos los préstamos desde Pillar 1
   * Endpoint REST: GET /recup-prestamos
   */
  async findAll(): Promise<RecupPrestamo[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<RecupPrestamo[]>(`${this.pillar1BaseUrl}/recup-prestamos`),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error al consultar préstamos desde Pillar 1',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Query 1: Filtrado por recup_estado
   * Filtra los préstamos según el estado proporcionado
   */
  async findByEstado(estado: string): Promise<RecupPrestamo[]> {
    const prestamos = await this.findAll();
    return prestamos.filter((p) => p.recup_estado === estado);
  }

  /**
   * Query 2: Reporte de préstamos vencidos
   * Retorna préstamos donde recup_fechaDevolucion < fecha actual
   * y recup_estado !== 'DEVUELTO'
   */
  async getReporteVencidos(): Promise<RecupPrestamosVencidosReport> {
    const prestamos = await this.findAll();
    const fechaActual = new Date();

    const vencidos = prestamos.filter((p) => {
      const fechaDevolucion = new Date(p.recup_fechaDevolucion);
      return fechaDevolucion < fechaActual && p.recup_estado !== 'DEVUELTO';
    });

    return {
      totalVencidos: vencidos.length,
      fechaReporte: fechaActual.toISOString(),
      prestamosVencidos: vencidos,
    };
  }

  /**
   * Query sugerida del dominio:
   * Préstamos vencidos con información del lector y libro prestado
   */
  async getPrestamosConDetalles(): Promise<RecupPrestamo[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<RecupPrestamo[]>(
          `${this.pillar1BaseUrl}/recup-prestamos?includeRelations=true`,
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error al consultar préstamos con detalles desde Pillar 1',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
