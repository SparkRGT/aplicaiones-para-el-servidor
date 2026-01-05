import { Controller, BadRequestException } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { MenuService } from './menu.service';

@Controller()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Crear plato (IDEMPOTENTE)
  @MessagePattern('plato.crear')
  async crear(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const headers = context.getMessage().properties.headers;

    // Allow idempotency key in header or payload
    const idempotencyKey = headers?.['idempotency-key'] || data?.idempotency_key || data?.idempotencyKey;

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key es obligatoria');
    }

    // Ensure payload contains idempotency_key for the service
    if (!data.idempotency_key) {
      data.idempotency_key = idempotencyKey;
    }

    return this.menuService.crearPlato(data);
  }

  // Listar platos
  @MessagePattern('plato.listar')
  async listar() {
    return this.menuService.listarPlatos();
  }

  // Obtener plato por ID
  @MessagePattern('plato.obtener')
  async obtener(@Payload() data: any) {
    return this.menuService.obtenerPlatoPorId(data.id);
  }

  // Listar platos por menú
  @MessagePattern('plato.listar_por_menu')
  async listarPorMenu(@Payload() data: any) {
    return this.menuService.listarPlatosPorMenu(data.menu_id);
  }

  // Crear menú
  @MessagePattern('menu.crear')
  async crearMenu(@Payload() data: any) {
    return this.menuService.crearMenu(data);
  }

  // Listar menús
  @MessagePattern('menu.listar')
  async listarMenus() {
    return this.menuService.obtenerMenus();
  }

  // Obtener menú por ID
  @MessagePattern('menu.obtener')
  async obtenerMenu(@Payload() data: any) {
    return this.menuService.obtenerMenuPorId(data.id);
  }

  // Crear categoría
  @MessagePattern('categoria.crear')
  async crearCategoria(@Payload() data: any) {
    return this.menuService.crearCategoria(data);
  }

  // Listar categorías
  @MessagePattern('categoria.listar')
  async listarCategorias() {
    return this.menuService.obtenerCategorias();
  }

  // Obtener categoría por ID
  @MessagePattern('categoria.obtener')
  async obtenerCategoria(@Payload() data: any) {
    return this.menuService.obtenerCategoriaPorId(data.id);
  }
}

