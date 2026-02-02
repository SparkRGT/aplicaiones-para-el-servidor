export class CreateRecupPrestamoDto {
  recup_codigo: string;
  recup_fechaPrestamo: Date;
  recup_fechaDevolucion: Date;
  recup_estado: string;
  recup_fechaRealDevolucion?: Date;
  recup_lectorId: number;
  recup_libroId: number;
}
