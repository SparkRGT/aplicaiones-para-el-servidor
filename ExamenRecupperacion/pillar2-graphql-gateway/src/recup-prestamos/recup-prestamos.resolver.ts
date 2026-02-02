import { Resolver, Query, Args } from '@nestjs/graphql';
import { RecupPrestamosService } from './recup-prestamos.service';
import { RecupPrestamo, RecupPrestamosVencidosReport } from './object-types';

@Resolver(() => RecupPrestamo)
export class RecupPrestamosResolver {
  constructor(private readonly recupPrestamosService: RecupPrestamosService) {}

  /**
   * Query: Obtener todos los préstamos
   * Consume: GET /recup-prestamos
   */
  @Query(() => [RecupPrestamo], {
    name: 'recupPrestamos',
    description: 'Obtiene todos los préstamos desde Pillar 1',
  })
  async findAll(): Promise<RecupPrestamo[]> {
    return this.recupPrestamosService.findAll();
  }

  /**
   * Query 1: Filtrado por estado
   * Filtra préstamos por recup_estado (SOLICITADO | APROBADO | ENTREGADO | DEVUELTO | VENCIDO)
   */
  @Query(() => [RecupPrestamo], {
    name: 'recupPrestamosPorEstado',
    description: 'Filtra préstamos por estado (SOLICITADO | APROBADO | ENTREGADO | DEVUELTO | VENCIDO)',
  })
  async findByEstado(
    @Args('estado', { description: 'Estado del préstamo a filtrar' }) estado: string,
  ): Promise<RecupPrestamo[]> {
    return this.recupPrestamosService.findByEstado(estado);
  }

  /**
   * Query 2: Reporte de préstamos vencidos
   * Agregación de préstamos donde recup_fechaDevolucion < fecha actual
   */
  @Query(() => RecupPrestamosVencidosReport, {
    name: 'recupReporteVencidos',
    description: 'Reporte agregado de préstamos vencidos',
  })
  async getReporteVencidos(): Promise<RecupPrestamosVencidosReport> {
    return this.recupPrestamosService.getReporteVencidos();
  }

  /**
   * Query GraphQL sugerida:
   * Préstamos vencidos con información del lector y libro prestado
   */
  @Query(() => [RecupPrestamo], {
    name: 'recupPrestamosConDetalles',
    description: 'Préstamos con información del lector y libro prestado',
  })
  async getPrestamosConDetalles(): Promise<RecupPrestamo[]> {
    return this.recupPrestamosService.getPrestamosConDetalles();
  }
}
