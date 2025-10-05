import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Pago } from '../entities/pago.entity';
import { Factura } from '../entities/factura.entity';

@Injectable()
export class PagosService {
  private readonly inventarioServiceUrl: string;
  private readonly solicitudesServiceUrl: string;

  constructor(
    @InjectRepository(Pago)
    private pagosRepository: Repository<Pago>,
    @InjectRepository(Factura)
    private facturasRepository: Repository<Factura>,
    private readonly httpService: HttpService,
  ) {
    this.inventarioServiceUrl = process.env.INVENTARIO_SERVICE_URL || 'http://inventario-service:3004';
    this.solicitudesServiceUrl = process.env.SOLICITUDES_SERVICE_URL || 'http://solicitudes-service:3002';
  }

  async procesarPago(data: { solicitudId: number; monto: number; userId: number; productoId: number; cantidad: number; userEmail: string }) {
    // 1. Verificar que no exista ya un pago para esta solicitud
    const pagoExistente = await this.pagosRepository.findOne({
      where: { solicitudId: data.solicitudId }
    });
    if (pagoExistente) {
      throw new BadRequestException('Ya existe un pago para esta solicitud');
    }

    // 2. Crear pago
    const pago = this.pagosRepository.create({
      solicitudId: data.solicitudId,
      userId: data.userId,
      monto: data.monto,
      estado: 'completado',
    });
    await this.pagosRepository.save(pago);

    // 3. Generar factura automáticamente
    const numeroFactura = `FACT-${String(pago.id).padStart(6, '0')}`;
    const factura = this.facturasRepository.create({
      numero: numeroFactura,
      monto: data.monto,
      pago: pago,
    });
    await this.facturasRepository.save(factura);

    // 4. Enviar notificación por email (simulada)
    const emailNotificacion = this.simularEnvioEmail(data.userEmail, factura.numero, data.monto);

    // 5. Actualizar inventario automáticamente
    let inventarioResponse;
    try {
      inventarioResponse = await firstValueFrom(
        this.httpService.put(`${this.inventarioServiceUrl}/inventario/${data.productoId}/actualizar`, {
          cantidad: -data.cantidad,
        }),
      );
    } catch (error) {
      throw new BadRequestException('Error al actualizar inventario');
    }

    return {
      pago: {
        id: pago.id,
        solicitudId: pago.solicitudId,
        monto: pago.monto,
        estado: pago.estado,
        createdAt: pago.createdAt,
      },
      factura: {
        id: factura.id,
        numero: factura.numero,
        monto: factura.monto,
        createdAt: factura.createdAt,
      },
      notificacion_email: emailNotificacion,
      inventario_actualizado: {
        productoId: inventarioResponse.data.id,
        nombre: inventarioResponse.data.nombre,
        stock_actual: inventarioResponse.data.stock,
      },
    };
  }

  private simularEnvioEmail(email: string, numeroFactura: string, monto: number): any {
    console.log('📧 ========================================');
    console.log('📧 SIMULACIÓN DE ENVÍO DE EMAIL');
    console.log('📧 ========================================');
    console.log(`📧 Para: ${email}`);
    console.log(`📧 Asunto: Factura ${numeroFactura} - Pago Confirmado`);
    console.log(`📧 Mensaje:`);
    console.log(`📧 `);
    console.log(`📧 Estimado cliente,`);
    console.log(`📧 `);
    console.log(`📧 Su pago ha sido procesado exitosamente.`);
    console.log(`📧 `);
    console.log(`📧 Detalles del pago:`);
    console.log(`📧 - Número de factura: ${numeroFactura}`);
    console.log(`📧 - Monto: $${monto}`);
    console.log(`📧 `);
    console.log(`📧 Gracias por su compra.`);
    console.log(`📧 `);
    console.log('📧 ========================================');

    return {
      enviado: true,
      destinatario: email,
      asunto: `Factura ${numeroFactura} - Pago Confirmado`,
      mensaje: 'Email enviado exitosamente (simulado)',
    };
  }

  async findBySolicitud(solicitudId: number) {
    const pago = await this.pagosRepository.findOne({
      where: { solicitudId },
      relations: ['factura'],
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado para esta solicitud');
    }

    return pago;
  }

  async findFactura(id: number) {
    const factura = await this.facturasRepository.findOne({ where: { id } });
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }
    return factura;
  }
}
