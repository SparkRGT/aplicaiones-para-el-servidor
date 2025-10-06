import "reflect-metadata";
export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "restaurante.db",
    synchronize: true,
    logging: false,
    entities: [Restaurante, Mesa, Cliente],
});
