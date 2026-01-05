import { z } from "zod";
import { buscarPlato } from "../services/gateway-client";

export const buscarPlatoTool = {
  name: "buscar_plato",
  description: "Busca platos por texto (nombre/descripcion).",
  inputSchema: z.object({
    query: z.string().min(2),
  }),
  execute: async (args: any) => {
    const { query } = buscarPlatoTool.inputSchema.parse(args);
    return await buscarPlato(query);
  },
};

