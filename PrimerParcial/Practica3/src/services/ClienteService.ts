import { AppDataSource } from "../data-source.js";
import { Cliente } from "../entidades/Cliente.js";

export class ClienteService {
  private repo = AppDataSource.getRepository(Cliente);

  async create(data: Partial<Cliente>) {
    const cliente = this.repo.create(data);
    return await this.repo.save(cliente);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id_cliente: id } });
  }

  async update(id: number, data: Partial<Cliente>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
