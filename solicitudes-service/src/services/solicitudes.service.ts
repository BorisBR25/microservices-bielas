import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Solicitud } from '../entities/solicitud.entity';

@Injectable()
export class SolicitudesService {
  private readonly pagosServiceUrl: string;
  private readonly inventarioServiceUrl: string;

  constructor(
    @InjectRepository(Solicitud)
    private solicitudesRepository: Repository<Solicitud>,
    private readonly httpService: HttpService,
  ) {
    this.pagosServiceUrl = process.env.PAGOS_SERVICE_URL || 'http://localhost:3003';
    this.inventarioServiceUrl = process.env.INVENTARIO_SERVICE_URL || 'http://localhost:3004';
  }

  async create(data: any, userId: number) {
    // 1. Verificar stock disponible
    let producto: any;
    try {
      const productoResponse = await firstValueFrom(
        this.httpService.get(`${this.inventarioServiceUrl}/inventario/${data.productoId}`),
      );
      producto = productoResponse.data;
    } catch (error) {
      throw new BadRequestException('Producto no encontrado en inventario');
    }

    if (producto.stock < data.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${producto.stock}, Solicitado: ${data.cantidad}`,
      );
    }

    // 2. Crear la solicitud (estado pendiente de pago)
    const monto = producto.precio * data.cantidad;
    const nuevaSolicitud = this.solicitudesRepository.create({
      ...data,
      userId,
      estado: 'pendiente_pago',
    }) as unknown as Solicitud;
    const solicitud: Solicitud = await this.solicitudesRepository.save(nuevaSolicitud);

    return {
      solicitud,
      monto_total: monto,
      producto: {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
      },
      mensaje: 'Solicitud creada. Proceda a realizar el pago en el endpoint POST /pagos',
    };
  }

  async findAll() {
    return this.solicitudesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const solicitud = await this.solicitudesRepository.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return solicitud;
  }

  async update(id: number, data: any) {
    const solicitud = await this.findOne(id);
    Object.assign(solicitud, data);
    return this.solicitudesRepository.save(solicitud);
  }

  async remove(id: number) {
    const solicitud = await this.findOne(id);
    await this.solicitudesRepository.remove(solicitud);
    return { message: 'Solicitud eliminada exitosamente' };
  }
}
