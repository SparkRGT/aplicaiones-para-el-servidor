import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { RestauranteService } from "./services/RestauranteService";
import { MesaService } from "./services/MesaService";
import { ClienteService } from "./services/ClienteService";
async function main() {
    await AppDataSource.initialize();
    console.log("📦 Base de datos inicializada correctamente");
    const restauranteService = new RestauranteService();
    const mesaService = new MesaService();
    const clienteService = new ClienteService();
    // 🏢 Crear un restaurante
    const rest = await restauranteService.create({
        nombre: "La Buena Mesa",
        direccion: "Av. Central 123",
        telefono: "0987654321",
    });
    console.log("✅ Restaurante creado:", rest);
    // 🍽️ Crear mesas asociadas
    const mesa1 = await mesaService.create({ numero: 1, capacidad: 4, estado: "disponible", restaurante: rest });
    const mesa2 = await mesaService.create({ numero: 2, capacidad: 2, estado: "ocupada", restaurante: rest });
    console.log("✅ Mesas creadas:", [mesa1, mesa2]);
    // 👤 Crear clientes
    const cliente1 = await clienteService.create({
        nombre: "Carlos Pérez",
        correo: "carlos@example.com",
        telefono: "0991112233",
    });
    const cliente2 = await clienteService.create({
        nombre: "Ana Torres",
        correo: "ana@example.com",
        telefono: "0988885555",
    });
    console.log("✅ Clientes creados:", [cliente1, cliente2]);
    // 🔍 Consultar todo
    const restaurantes = await restauranteService.findAll();
    console.log("🏢 Restaurantes:", restaurantes);
    const mesas = await mesaService.findAll();
    console.log("🍽️ Mesas:", mesas);
    const clientes = await clienteService.findAll();
    console.log("👤 Clientes:", clientes);
}
main().catch((err) => console.error("❌ Error en ejecución:", err));
