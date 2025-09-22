import React from "react";
import type { IPlato } from "../interface/modelo_base";

interface Props {
  plato: IPlato;
}

const PlatoCard: React.FC<Props> = ({ plato }) => {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "1rem",
      margin: "0.5rem",
      borderRadius: "8px",
      backgroundColor: plato.disponible ? "#e8f5e9" : "#ffebee"
    }}>
      <h3>{plato.nombre}</h3>
      <p>{plato.descripcion}</p>
      <p><b>Precio:</b> ${plato.precio}</p>
      <p><b>Categoría:</b> {plato.categoria.nombre}</p>
      <p><b>Estado:</b> {plato.disponible ? "Disponible ✅" : "No disponible ❌"}</p>
    </div>
  );
};

export default PlatoCard;
