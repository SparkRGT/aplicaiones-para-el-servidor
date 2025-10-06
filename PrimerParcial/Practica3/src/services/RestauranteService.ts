import { AppDataSource } from "../data-source.js";
import { Restaurante } from "../entidades/Restaurante.js";

export class RestauranteService {
  private repo = AppDataSource.getRepository(Restaurante);

  async create(data: Partial<Restaurante>) {
    const restaurante = this.repo.create(data);
    return await this.repo.save(restaurante);
  }

  async findAll() {
    return await this.repo.find({ relations: ["mesas"] });
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id_restaurante: id }, relations: ["mesas"] });
  }

  async update(id: number, data: Partial<Restaurante>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
