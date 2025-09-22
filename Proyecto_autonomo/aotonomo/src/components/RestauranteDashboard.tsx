import React, { useState } from "react";
import type { ICliente, IMesa, IReserva, IFilaVirtual, IMenu } from "./interface/modelo_base";
import Menu from "./Menu/Menu";
import MesasGrid from "./Mesas/MesasGrid";
import ReservaForm from "./Reservas/Reservaform";
import ReservasList from "./Reservas/ReservaList";
import FilaVirtual from "./FilaVirtual/FilaVirtual";

const RestauranteDashboard: React.FC = () => {
  // Datos simulados
  const [clientes] = useState<ICliente[]>([
    { id_cliente: 1, nombre: "Ana", correo: "ana@test.com", telefono: "123456" },
    { id_cliente: 2, nombre: "Luis", correo: "luis@test.com", telefono: "654321" },
  ]);

  const [mesas] = useState<IMesa[]>([
    { id_mesa: 1, numero: "M1", capacidad: 2, estado: "libre" },
    { id_mesa: 2, numero: "M2", capacidad: 4, estado: "ocupada" },
    { id_mesa: 3, numero: "M3", capacidad: 6, estado: "reservada" },
  ]);

  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [fila] = useState<IFilaVirtual[]>([
    { id_fila: 1, id_cliente: 2, posicion: 1, estado: "esperando" },
  ]);

  const menu: IMenu = {
    id_menu: 1,
    fecha: new Date(),
    platos: [
      { id_plato: 1, nombre: "Pizza Margarita", descripcion: "Queso y albahaca", precio: 8.99, disponible: true, categoria: { id_categoria: 1, nombre: "Platos principales" } },
      { id_plato: 2, nombre: "Tiramisú", descripcion: "Postre italiano", precio: 4.5, disponible: false, categoria: { id_categoria: 2, nombre: "Postres" } },
    ],
  };

  const handleAddReserva = (reserva: IReserva) => {
    setReservas([...reservas, reserva]);
  };

  return (
    <div>
      <h1>🍴 Dashboard del Restaurante</h1>

      <Menu menu={menu} />
      <MesasGrid mesas={mesas} />
      <ReservaForm clientes={clientes} mesas={mesas} onAddReserva={handleAddReserva} />
      <ReservasList reservas={reservas} />
      <FilaVirtual fila={fila} />
    </div>
  );
};

export default RestauranteDashboard;
