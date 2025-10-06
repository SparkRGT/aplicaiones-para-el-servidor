import { AppDataSource } from "../data-source";
import { Restaurante } from "../entidades/Restaurante";
export class RestauranteService {
    constructor() {
        this.repo = AppDataSource.getRepository(Restaurante);
    }
    async create(data) {
        const restaurante = this.repo.create(data);
        return await this.repo.save(restaurante);
    }
    async findAll() {
        return await this.repo.find({ relations: ["mesas"] });
    }
    async findOne(id) {
        return await this.repo.findOne({ where: { id_restaurante: id }, relations: ["mesas"] });
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
