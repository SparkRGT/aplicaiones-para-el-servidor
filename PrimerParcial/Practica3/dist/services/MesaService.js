import { AppDataSource } from "../data-source";
import { Mesa } from "../interface/Mesa";
export class MesaService {
    constructor() {
        this.repo = AppDataSource.getRepository(Mesa);
    }
    async create(data) {
        const mesa = this.repo.create(data);
        return await this.repo.save(mesa);
    }
    async findAll() {
        return await this.repo.find({ relations: ["restaurante"] });
    }
    async findOne(id) {
        return await this.repo.findOne({ where: { id_mesa: id }, relations: ["restaurante"] });
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
