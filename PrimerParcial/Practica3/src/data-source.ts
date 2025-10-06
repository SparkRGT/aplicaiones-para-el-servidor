import "reflect-metadata";
import { DataSource } from "typeorm";
import { Restaurante } from "./entidades/Restaurante.js";
import { Mesa } from "./entidades/Mesa.js";
import { Cliente } from "./entidades/Cliente.js";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "restaurante.db",
  synchronize: true,
  logging: false,
  entities: [Restaurante, Mesa, Cliente],
});
