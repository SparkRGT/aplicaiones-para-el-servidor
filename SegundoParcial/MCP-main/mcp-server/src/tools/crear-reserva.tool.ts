import { z } from "zod";
import { crearReserva } from "../services/gateway-client";

const toStr = z.union([z.string(), z.number()]).transform(String);

export const crearReservaTool = {
  name: "crear_reserva",
  description: "Crea una nueva reserva. Requiere id_cliente, id_mesa, fecha, hora_inicio y hora_fin.",
  inputSchema: z.object({
    id_cliente: toStr,
    id_mesa: toStr,
    fecha: z.string(),
    hora_inicio: z.string(),
    hora_fin: z.string(),
  }),
  execute: async (args: any) => {
    const { id_cliente, id_mesa, fecha, hora_inicio, hora_fin } =
      crearReservaTool.inputSchema.parse(args);

    return await crearReserva({
      id_cliente: parseInt(id_cliente),
      id_mesa: parseInt(id_mesa),
      fecha,
      hora_inicio,
      hora_fin,
    });
  },
};

