import { z } from "zod";
import { obtenerServicioPorId } from "../services/gateway-client";

const toStr = z.union([z.string(), z.number()]).transform(String);

export const validarServicioExisteTool = {
  name: "validar_servicio_existe",
  description: "Valida si un servicio existe por ID.",
  inputSchema: z.object({
    servicioId: toStr,
  }),
  execute: async (args: any) => {
    const { servicioId } =
      validarServicioExisteTool.inputSchema.parse(args);

    try {
      const servicio = await obtenerServicioPorId(servicioId);
      return { ok: true, servicio };
    } catch {
      return { ok: false };
    }
  },
};
