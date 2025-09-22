import React from "react";
import type { IReserva } from "../interface/modelo_base";

interface Props {
  reservas: IReserva[];
}

const ReservasList: React.FC<Props> = ({ reservas }) => {
  return (
    <div>
      <h3>📋 Lista de Reservas</h3>
      {reservas.length === 0 && <p>No hay reservas registradas</p>}
      <ul>
        {reservas.map((r) => (
          <li key={r.id_reserva}>
            Mesa {r.id_mesa} – Cliente {r.id_cliente} – {r.estado}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReservasList;
