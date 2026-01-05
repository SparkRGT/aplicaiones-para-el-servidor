import { z } from "zod";
import { buscarServicio } from "../services/gateway-client";

export const buscarServicioTool = {
  name: "buscar_servicio",
  description: "Busca servicios por texto (nombre/descripcion).",
  inputSchema: z.object({
    query: z.string().min(2),
  }),
  execute: async (args: any) => {
    const { query } = buscarServicioTool.inputSchema.parse(args);
    return await buscarServicio(query);
  },
};
