import { z } from "zod";
import { crearPlato } from "../services/gateway-client";

const toStr = z.union([z.string(), z.number()]).transform(String);

export const crearPlatoTool = {
  name: "crear_plato",
  description: "Crea un nuevo plato en un menú. Requiere nombre, precio, id_menu e id_categoria.",
  inputSchema: z.object({
    nombre: z.string().min(1),
    descripcion: z.string().optional(),
    precio: z.number().positive(),
    id_menu: toStr,
    id_categoria: toStr,
    disponible: z.boolean().optional().default(true),
  }),
  execute: async (args: any) => {
    const { nombre, descripcion, precio, id_menu, id_categoria, disponible } =
      crearPlatoTool.inputSchema.parse(args);

    return await crearPlato({
      nombre,
      descripcion,
      precio,
      id_menu: parseInt(id_menu),
      id_categoria: parseInt(id_categoria),
      disponible,
    });
  },
};

