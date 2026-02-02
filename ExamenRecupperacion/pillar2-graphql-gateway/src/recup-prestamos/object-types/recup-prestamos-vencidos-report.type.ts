import { ObjectType, Field, Int } from '@nestjs/graphql';
import { RecupPrestamo } from './recup-prestamo.type';

@ObjectType({ description: 'Reporte de préstamos vencidos' })
export class RecupPrestamosVencidosReport {
  @Field(() => Int, { description: 'Total de préstamos vencidos' })
  totalVencidos: number;

  @Field({ description: 'Fecha de generación del reporte' })
  fechaReporte: string;

  @Field(() => [RecupPrestamo], { description: 'Lista de préstamos vencidos' })
  prestamosVencidos: RecupPrestamo[];
}
