import React from "react";
import type { IMesa } from "../interface/modelo_base";

interface Props {
  mesa: IMesa;
  onSelect?: (mesa: IMesa) => void;
}

const MesaCard: React.FC<Props> = ({ mesa, onSelect }) => {
  const getColor = () => {
    switch (mesa.estado) {
      case "libre": return "#c8e6c9";   // verde claro
      case "ocupada": return "#ffcdd2"; // rojo claro
      case "reservada": return "#fff9c4"; // amarillo claro
    }
  };

  return (
    <div
      onClick={() => onSelect?.(mesa)}
      style={{
        width: "80px",
        height: "80px",
        border: "2px solid #333",
        borderRadius: "10px",
        backgroundColor: getColor(),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        margin: "0.5rem"
      }}
    >
      <b>{mesa.numero}</b>
      <small>{mesa.capacidad} pers.</small>
    </div>
  );
};

export default MesaCard;
