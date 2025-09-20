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
  numero: string; // Ejemplo: "M1", "M2", "VIP-3"
  capacidad: number; // Número de personas que caben en la mesa
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
  posicion: number; // Orden en la fila
  estado: 'esperando' | 'notificado' | 'asignado' | 'cancelado';
  cliente?: ICliente;
}

// --- Restaurante ---
export interface IRestaurante {
  id_restaurante: number;
  nombre: string;
  direccion: string;
  telefono: string;
  mesas: IMesa[];
  reservas: IReserva[];
}


interface MenuCardProps {
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
}