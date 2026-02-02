import { ObjectType, Field, Int } from '@nestjs/graphql';
import { RecupLector } from './recup-lector.type';
import { RecupLibro } from './recup-libro.type';

@ObjectType({ description: 'Entidad Transaccional Principal - Préstamo' })
export class RecupPrestamo {
  @Field(() => Int, { description: 'PK, autoincrement' })
  prestamoId: number;

  @Field({ description: 'Código único de préstamo (ej: PRE-001)' })
  recup_codigo: string;

  @Field({ description: 'Fecha del préstamo' })
  recup_fechaPrestamo: string;

  @Field({ description: 'Fecha esperada de devolución' })
  recup_fechaDevolucion: string;

  @Field({ description: 'SOLICITADO | APROBADO | ENTREGADO | DEVUELTO | VENCIDO' })
  recup_estado: string;

  @Field({ nullable: true, description: 'Fecha real de devolución (nullable)' })
  recup_fechaRealDevolucion?: string;

  @Field(() => Int, { description: 'FK -> Recup_Lector' })
  recup_lectorId: number;

  @Field(() => Int, { description: 'FK -> Recup_Libro' })
  recup_libroId: number;

  @Field(() => RecupLector, { nullable: true, description: 'Información del lector' })
  lector?: RecupLector;

  @Field(() => RecupLibro, { nullable: true, description: 'Información del libro' })
  libro?: RecupLibro;
}
