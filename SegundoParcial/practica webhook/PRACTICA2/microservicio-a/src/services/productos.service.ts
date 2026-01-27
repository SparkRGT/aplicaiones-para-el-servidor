import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../entities/producto.entity';
import { RabbitMQPublisherService } from '../publishers/rabbitmq-publisher.service';
import { SupabaseAuditService } from './supabase-audit.service';
import { WebhookPublisherService } from './webhook-publisher.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto, 'microservicio_a_db')
    private productoRepository: Repository<Producto>,
    private rabbitMQPublisher: RabbitMQPublisherService,
    private supabaseAudit: SupabaseAuditService,
    private webhookPublisher: WebhookPublisherService,
  ) {}

  async crear(productoData: any): Promise<Producto> {
    const producto = this.productoRepository.create(productoData);
    const productoGuardado = await this.productoRepository.save(producto) as unknown as Producto;

    // Registrar en Supabase
    await this.supabaseAudit.logOperation({
      operationType: 'CREATE',
      entityType: 'producto',
      entityId: productoGuardado.id,
      metadata: {
        nombre: productoGuardado.nombre,
        precio: productoGuardado.precio,
        stock: productoGuardado.stock,
      },
    });

    // Publicar evento a RabbitMQ
    await this.rabbitMQPublisher.publicarEvento({
      eventId: uuidv4(),
      eventType: 'producto.creado',
      source: 'microservicio-a',
      timestamp: new Date().toISOString(),
      data: {
        productoId: productoGuardado.id,
        nombre: productoGuardado.nombre,
        precio: productoGuardado.precio,
        stock: productoGuardado.stock,
      },
    });

    // Publicar webhook
    await this.webhookPublisher.publishWebhook(
      'producto.creado',
      {
        productoId: productoGuardado.id,
        nombre: productoGuardado.nombre,
        precio: productoGuardado.precio,
        stock: productoGuardado.stock,
      },
      productoGuardado.id,
    );

    return productoGuardado;
  }

  async listar(): Promise<Producto[]> {
    const productos = await this.productoRepository.find({
      where: { activo: true },
    });

    // Registrar consulta en Supabase
    await this.supabaseAudit.logOperation({
      operationType: 'READ',
      entityType: 'producto',
      metadata: {
        action: 'list_all',
        count: productos.length,
      },
    });

    return productos;
  }

  async obtener(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
    });

    if (!producto) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    // Registrar consulta en Supabase
    await this.supabaseAudit.logOperation({
      operationType: 'READ',
      entityType: 'producto',
      entityId: id,
      metadata: {
        action: 'get_by_id',
        found: true,
      },
    });

    return producto;
  }

  async actualizar(id: number, productoData: any): Promise<Producto> {
    const producto = await this.obtener(id);
    const datosAnteriores = { ...producto };
    Object.assign(producto, productoData);
    const productoActualizado = await this.productoRepository.save(producto);

    // Registrar actualización en Supabase
    await this.supabaseAudit.logOperation({
      operationType: 'UPDATE',
      entityType: 'producto',
      entityId: id,
      metadata: {
        cambios: productoData,
        datosAnteriores: {
          nombre: datosAnteriores.nombre,
          precio: datosAnteriores.precio,
          stock: datosAnteriores.stock,
        },
        datosNuevos: {
          nombre: productoActualizado.nombre,
          precio: productoActualizado.precio,
          stock: productoActualizado.stock,
        },
      },
    });

    // Publicar evento a RabbitMQ
    await this.rabbitMQPublisher.publicarEvento({
      eventId: uuidv4(),
      eventType: 'producto.actualizado',
      source: 'microservicio-a',
      timestamp: new Date().toISOString(),
      data: {
        productoId: productoActualizado.id,
        nombre: productoActualizado.nombre,
        precio: productoActualizado.precio,
        stock: productoActualizado.stock,
      },
    });

    // Publicar webhook
    await this.webhookPublisher.publishWebhook(
      'producto.actualizado',
      {
        productoId: productoActualizado.id,
        nombre: productoActualizado.nombre,
        precio: productoActualizado.precio,
        stock: productoActualizado.stock,
      },
      productoActualizado.id,
    );

    return productoActualizado;
  }

  async eliminar(id: number): Promise<void> {
    const producto = await this.obtener(id);
    producto.activo = false;
    await this.productoRepository.save(producto);

    // Registrar eliminación en Supabase
    await this.supabaseAudit.logOperation({
      operationType: 'DELETE',
      entityType: 'producto',
      entityId: id,
      metadata: {
        softDelete: true,
        productoNombre: producto.nombre,
      },
    });

    // Publicar evento a RabbitMQ
    await this.rabbitMQPublisher.publicarEvento({
      eventId: uuidv4(),
      eventType: 'producto.eliminado',
      source: 'microservicio-a',
      timestamp: new Date().toISOString(),
      data: {
        productoId: id,
      },
    });

    // Publicar webhook
    await this.webhookPublisher.publishWebhook(
      'producto.eliminado',
      {
        productoId: id,
        nombre: producto.nombre,
      },
      id,
    );
  }

  async crearOrden(productoId: number, ordenData: any): Promise<any> {
    const producto = await this.obtener(productoId);

    if (producto.stock < ordenData.cantidad) {
      throw new Error('Stock insuficiente');
    }

    // Registrar creación de orden en Supabase
    await this.supabaseAudit.logOperation({
      operationType: 'CREATE',
      entityType: 'orden',
      metadata: {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: ordenData.cantidad,
        precioUnitario: producto.precio,
        total: producto.precio * ordenData.cantidad,
      },
    });

    // Publicar evento para que Microservicio B procese la orden
    const evento = {
      eventId: uuidv4(),
      eventType: 'orden.solicitada',
      source: 'microservicio-a',
      timestamp: new Date().toISOString(),
      data: {
        productoId: producto.id,
        cantidad: ordenData.cantidad,
        precioUnitario: producto.precio,
      },
    };

    await this.rabbitMQPublisher.publicarEvento(evento);

    return {
      mensaje: 'Orden solicitada, siendo procesada por Microservicio B',
      eventoId: evento.eventId,
    };
  }
}

