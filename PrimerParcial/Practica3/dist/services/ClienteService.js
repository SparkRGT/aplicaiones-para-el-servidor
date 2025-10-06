import { AppDataSource } from "../data-source";
import { Cliente } from "../entities/Cliente";
export class ClienteService {
    constructor() {
        this.repo = AppDataSource.getRepository(Cliente);
    }
    async create(data) {
        const cliente = this.repo.create(data);
        return await this.repo.save(cliente);
    }
    async findAll() {
        return await this.repo.find();
    }
    async findOne(id) {
        return await this.repo.findOne({ where: { id_cliente: id } });
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
