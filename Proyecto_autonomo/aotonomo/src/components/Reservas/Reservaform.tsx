import React, { useState } from "react";
import type { IReserva, ICliente, IMesa } from "../interface/modelo_base";

interface Props {
  clientes: ICliente[];
  mesas: IMesa[];
  onAddReserva: (reserva: IReserva) => void;
}

const ReservaForm: React.FC<Props> = ({ clientes, mesas, onAddReserva }) => {
  const [idCliente, setIdCliente] = useState<number>(clientes[0]?.id_cliente || 0);
  const [idMesa, setIdMesa] = useState<number>(mesas[0]?.id_mesa || 0);
  const [fecha, setFecha] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevaReserva: IReserva = {
      id_reserva: Date.now(),
      id_cliente: idCliente,
      id_mesa: idMesa,
      fecha: new Date(fecha),
      hora_inicio: new Date(`${fecha}T${horaInicio}`),
      hora_fin: new Date(`${fecha}T${horaInicio}`), // simplificado
      estado: "pendiente",
    };
    onAddReserva(nuevaReserva);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <h3>📅 Nueva Reserva</h3>
      <label>
        Cliente:
        <select value={idCliente} onChange={(e) => setIdCliente(Number(e.target.value))}>
          {clientes.map((c) => (
            <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Mesa:
        <select value={idMesa} onChange={(e) => setIdMesa(Number(e.target.value))}>
          {mesas.map((m) => (
            <option key={m.id_mesa} value={m.id_mesa}>{m.numero}</option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Fecha:
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </label>
      <br />
      <label>
        Hora inicio:
        <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
      </label>
      <br />
      <button type="submit">Reservar</button>
    </form>
  );
};

export default ReservaForm;
