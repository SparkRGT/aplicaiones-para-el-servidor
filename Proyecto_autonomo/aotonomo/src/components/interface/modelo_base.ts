// --- Cliente ---
export interface ICliente {
  id_cliente: number;
  nombre: string;
  correo: string;
  telefono: string;
}

// --- Mesa ---
export interface IMesa {
  id_mesa: number;
  numero: string; 
  capacidad: number; 
  estado: 'libre' | 'ocupada' | 'reservada';
}

// --- Reserva ---
export interface IReserva {
  id_reserva: number;
  id_cliente: number;
  id_mesa: number;
  fecha: Date;
  hora_inicio: Date;
  hora_fin: Date;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'finalizada';
  cliente?: ICliente;
  mesa?: IMesa;
}

// --- Fila Virtual ---
export interface IFilaVirtual {
  id_fila: number;
  id_cliente: number;
  posicion: number; 
  estado: 'esperando' | 'notificado' | 'asignado' | 'cancelado';
  cliente?: ICliente;
}

export interface IRestaurante {
  id_restaurante: number;
  nombre: string;
  direccion: string;
  telefono: string;
  mesas: IMesa[];
  reservas: IReserva[];
  menu: IMenu;
}

// --- Categoría del Menú ---
export interface ICategoriaMenu {
  id_categoria: number;
  nombre: string; 
}

// --- Plato o Comida ---
export interface IPlato {
  id_plato: number;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean; 
  categoria: ICategoriaMenu;
}

// --- Menú completo ---
export interface IMenu {
  id_menu: number;
  fecha: Date; 
  platos: IPlato[];
}


