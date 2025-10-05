import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PagosService } from '../services/pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  async procesarPago(@Body() body: {
    solicitudId: number;
    monto: number;
    userId: number;
    productoId: number;
    cantidad: number;
    userEmail: string;
  }) {
    return this.pagosService.procesarPago(body);
  }

  @Get('solicitud/:solicitudId')
  async findBySolicitud(@Param('solicitudId') solicitudId: string) {
    return this.pagosService.findBySolicitud(+solicitudId);
  }
}
