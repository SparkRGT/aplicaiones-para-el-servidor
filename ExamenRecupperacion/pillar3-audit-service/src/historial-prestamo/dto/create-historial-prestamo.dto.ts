export class CreateHistorialPrestamoDto {
  prestamoId: number;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaCambio: Date;
  comentario?: string;
}
