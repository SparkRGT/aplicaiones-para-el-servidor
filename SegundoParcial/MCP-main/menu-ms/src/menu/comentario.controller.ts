import { Controller, BadRequestException } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { ComentarioService } from './comentario.service';

@Controller()
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  // 📝 Crear comentario (IDEMPOTENTE)
  @MessagePattern('comentario.crear')
  async crear(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const headers = context.getMessage().properties.headers;

    // Allow idempotency key in header or payload (gateway sets it in payload)
    const idempotencyKey = headers?.['idempotency-key'] || data?.idempotency_key || data?.idempotencyKey;

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key es obligatoria');
    }

    // Ensure payload contains idempotency_key for the service
    if (!data.idempotency_key) {
      data.idempotency_key = idempotencyKey;
    }

    return this.comentarioService.crearComentario(data);
  }

  // 📄 Listar comentarios
  @MessagePattern('comentario.listar')
  async listar() {
    return this.comentarioService.listarComentarios();
  }

  // 🔎 Obtener comentario por ID
  @MessagePattern('comentario.obtener')
  async obtener(@Payload() data: any) {
    return this.comentarioService.obtenerComentarioPorId(data.id);
  }

  // 📌 Listar comentarios por servicio
  @MessagePattern('comentario.listar_por_servicio')
  async listarPorServicio(@Payload() data: any) {
    return this.comentarioService.listarComentariosPorServicio(
      data.servicio_id,
    );
  }
}
