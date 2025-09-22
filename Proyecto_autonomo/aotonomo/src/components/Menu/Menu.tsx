import React from "react";
import type { IMenu } from "../interface/modelo_base";
import PlatoCard from "./PlatoCard";

interface Props {
  menu: IMenu;
}

const Menu: React.FC<Props> = ({ menu }) => {
  return (
    <div>
      <h2>Menú del día</h2>
      <p>Fecha: {menu.fecha.toDateString()}</p>

      <div>
        {menu.platos.map((plato) => (
          <PlatoCard key={plato.id_plato} plato={plato} />
        ))}
      </div>
    </div>
  );
};

export default Menu;
