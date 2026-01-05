import { z } from "zod";
import { crearComentario } from "../services/gateway-client";

// acepta string o number y lo transforma a string
const toStr = z.union([z.string(), z.number()]).transform(String);

export const registrarComentarioTool = {
  name: "registrar_comentario",
  description: "Registra un comentario asociado a un servicio.",
  inputSchema: z.object({
    servicio_id: toStr,
    cliente_id: toStr,
    titulo: z.string().min(1),
    texto: z.string().min(1),
  }),
  execute: async (args: any) => {
    const { servicio_id, cliente_id, titulo, texto } =
      registrarComentarioTool.inputSchema.parse(args);

    return await crearComentario(servicio_id, cliente_id, titulo, texto);
  },
};
