import "reflect-metadata";
import { AppDataSource } from "./data-source.js";
import { RestauranteService } from "./services/RestauranteService.js";
import { MesaService } from "./services/MesaService.js";
import { ClienteService } from "./services/ClienteService.js";

async function main() {
  await AppDataSource.initialize();
  console.log("📦 Base de datos inicializada correctamente");

  const restauranteService = new RestauranteService();
  const mesaService = new MesaService();
  const clienteService = new ClienteService();

  try {
    // Crear restaurante
    const rest = await restauranteService.create({ nombre: "La Buena Mesa", direccion: "Av. Central 123", telefono: "0987654321" });
    console.log("✅ Restaurante creado:", rest);

    // Crear mesas
    const mesa1 = await mesaService.create({ numero: 1, capacidad: 4, estado: "disponible", restaurante: rest });
    const mesa2 = await mesaService.create({ numero: 2, capacidad: 2, estado: "ocupada", restaurante: rest });
    console.log("✅ Mesas creadas:", [mesa1, mesa2]);

    // Crear clientes
    const cliente1 = await clienteService.create({ nombre: "Carlos Pérez", correo: "carlos@example.com", telefono: "0991112233" });
    const cliente2 = await clienteService.create({ nombre: "Ana Torres", correo: "ana@example.com", telefono: "0988885555" });
    console.log("✅ Clientes creados:", [cliente1, cliente2]);

    // Listar todo
    const restaurantes = await restauranteService.findAll();
    const mesas = await mesaService.findAll();
    const clientes = await clienteService.findAll();

    console.log("🏢 Restaurantes:", restaurantes);
    console.log("🍽️ Mesas:", mesas);
    console.log("👤 Clientes:", clientes);

    // Actualizar algunos registros
    await restauranteService.update(rest.id_restaurante, { nombre: "La Buena Mesa (Updated)" });
    await mesaService.update(mesa1.id_mesa, { estado: "reservada" });
    await clienteService.update(cliente1.id_cliente, { telefono: "0990000000" });
    console.log("🔧 Actualizaciones realizadas");

    // Eliminar
    await mesaService.remove(mesa1.id_mesa);
    await mesaService.remove(mesa2.id_mesa);
    await restauranteService.remove(rest.id_restaurante);
    await clienteService.remove(cliente1.id_cliente);
    await clienteService.remove(cliente2.id_cliente);
    console.log("🧹 Registros limpios");

    console.log("✅ Flujo completo de entidades y servicios ejecutado correctamente");
  } catch (err) {
    console.error("❌ Error en flujo de pruebas:", err);
  } finally {
    process.exit(0);
  }
}

main();
