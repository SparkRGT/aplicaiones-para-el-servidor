import { z } from "zod";
import { buscarReserva } from "../services/gateway-client";

export const buscarReservaTool = {
  name: "buscar_reserva",
  description: "Busca reservas por texto o parámetros.",
  inputSchema: z.object({
    query: z.string().min(2),
  }),
  execute: async (args: any) => {
    const { query } = buscarReservaTool.inputSchema.parse(args);
    return await buscarReserva(query);
  },
};

