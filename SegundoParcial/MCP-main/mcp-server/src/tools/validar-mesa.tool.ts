import { z } from "zod";
import { obtenerMesaPorId } from "../services/gateway-client";

const toStr = z.union([z.string(), z.number()]).transform(String);

export const validarMesaExisteTool = {
  name: "validar_mesa_existe",
  description: "Valida si una mesa existe por ID y está disponible.",
  inputSchema: z.object({
    mesaId: toStr,
  }),
  execute: async (args: any) => {
    const { mesaId } = validarMesaExisteTool.inputSchema.parse(args);

    try {
      const mesa = await obtenerMesaPorId(mesaId);
      return { ok: true, disponible: mesa.estado === 'disponible', mesa };
    } catch {
      return { ok: false };
    }
  },
};

