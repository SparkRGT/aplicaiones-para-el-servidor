import React from "react";
import type { IFilaVirtual } from "../interface/modelo_base";

interface Props {
  fila: IFilaVirtual[];
}

const FilaVirtual: React.FC<Props> = ({ fila }) => {
  return (
    <div>
      <h2>🕒 Fila Virtual</h2>
      {fila.length === 0 ? (
        <p>No hay clientes en espera</p>
      ) : (
        <ul>
          {fila.map((f) => (
            <li key={f.id_fila}>
              Cliente {f.id_cliente} – Posición {f.posicion} – Estado {f.estado}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilaVirtual;
