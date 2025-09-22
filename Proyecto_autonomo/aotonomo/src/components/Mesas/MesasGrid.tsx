import React, { useState } from "react";
import type { IMesa } from "../interface/modelo_base";
import MesaCard from "./Mesacard";

interface Props {
  mesas: IMesa[];
}

const MesasGrid: React.FC<Props> = ({ mesas }) => {
  const [seleccionada, setSeleccionada] = useState<IMesa | null>(null);

  return (
    <div>
      <h2>🪑 Mesas</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: "10px"
      }}>
        {mesas.map((mesa) => (
          <MesaCard key={mesa.id_mesa} mesa={mesa} onSelect={setSeleccionada} />
        ))}
      </div>

      {seleccionada && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Mesa seleccionada</h3>
          <p><b>Número:</b> {seleccionada.numero}</p>
          <p><b>Capacidad:</b> {seleccionada.capacidad} personas</p>
          <p><b>Estado:</b> {seleccionada.estado}</p>
        </div>
      )}
    </div>
  );
};

export default MesasGrid;
