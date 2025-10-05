import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProcesarPagoDto } from '../dto/procesar-pago.dto';

@ApiTags('Pagos')
@Controller('pagos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PagosController {
  private readonly pagosServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.pagosServiceUrl = process.env.PAGOS_SERVICE_URL || 'http://localhost:3003';
  }

  @Post()
  @ApiOperation({
    summary: 'Procesar pago manual',
    description: 'Procesa el pago de una solicitud, genera factura automáticamente, envía email y actualiza inventario'
  })
  @ApiBody({ type: ProcesarPagoDto })
  @ApiResponse({
    status: 201,
    description: 'Pago procesado exitosamente con factura generada, email enviado e inventario actualizado',
    schema: {
      example: {
        pago: {
          id: 1,
          solicitudId: 1,
          monto: 2500,
          estado: 'completado'
        },
        factura: {
          id: 1,
          numero: 'FACT-000001',
          monto: 2500
        },
        notificacion_email: {
          enviado: true,
          destinatario: 'admin@bielas.com',
          asunto: 'Factura FACT-000001 - Pago Confirmado'
        },
        inventario_actualizado: {
          productoId: 1,
          nombre: 'Biela Motor V8',
          stock_actual: 90
        }
      }
    }
  })
  async procesarPago(@Body() body: ProcesarPagoDto, @Req() req: any) {
    const user = req.user;
    const response = await firstValueFrom(
      this.httpService.post(`${this.pagosServiceUrl}/pagos`, {
        ...body,
        userId: user.userId,
      }, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Get('solicitud/:solicitudId')
  @ApiOperation({ summary: 'Obtener pago por ID de solicitud' })
  @ApiResponse({ status: 200, description: 'Pago encontrado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  async findBySolicitud(@Param('solicitudId') solicitudId: string, @Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.pagosServiceUrl}/pagos/solicitud/${solicitudId}`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Get('factura/:id')
  @ApiOperation({ summary: 'Obtener factura por ID' })
  @ApiResponse({ status: 200, description: 'Factura encontrada' })
  async getFactura(@Param('id') id: string, @Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.pagosServiceUrl}/facturas/${id}`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }
}
