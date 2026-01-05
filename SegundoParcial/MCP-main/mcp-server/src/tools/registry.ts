import { buscarReservaTool } from "./buscar-reserva.tool";
import { validarMesaExisteTool } from "./validar-mesa.tool";
import { crearReservaTool } from "./crear-reserva.tool";
import { buscarPlatoTool } from "./buscar-plato.tool";
import { crearPlatoTool } from "./crear-plato.tool";

type Tool = {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
};

const tools: Tool[] = [
  buscarReservaTool,
  validarMesaExisteTool,
  crearReservaTool,
  buscarPlatoTool,
  crearPlatoTool,
];

export const toolsRegistry = {
  list() {
    return tools.map((t) => ({ name: t.name, description: t.description }));
  },

  async call(name: string, args: any) {
    const tool = tools.find((t) => t.name === name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return await tool.execute(args);
  },
};
