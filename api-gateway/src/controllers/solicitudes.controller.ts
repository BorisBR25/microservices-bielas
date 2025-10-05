import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dto/update-solicitud.dto';

@ApiTags('Solicitudes')
@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SolicitudesController {
  private readonly solicitudesServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.solicitudesServiceUrl = process.env.SOLICITUDES_SERVICE_URL || 'http://localhost:3002';
  }

  @Post()
  @ApiOperation({
    summary: 'Crear nueva solicitud',
    description: 'Crea una solicitud y automáticamente procesa el pago, genera factura y actualiza inventario'
  })
  @ApiBody({ type: CreateSolicitudDto })
  @ApiResponse({
    status: 201,
    description: 'Solicitud creada exitosamente con pago procesado e inventario actualizado',
    schema: {
      example: {
        solicitud: {
          id: 1,
          productoId: 1,
          cantidad: 10,
          empresa: 'Automotriz XYZ S.A.',
          observaciones: 'Entrega urgente',
          userId: 1,
          estado: 'procesada'
        },
        pago: {
          id: 1,
          solicitudId: 1,
          monto: 2500.00,
          estado: 'completado'
        },
        factura: {
          id: 1,
          numero: 'FACT-001',
          monto: 2500.00
        },
        inventario: {
          id: 1,
          nombre: 'Biela Motor V8',
          stockAnterior: 100,
          stockActual: 90
        }
      }
    }
  })
  async create(@Body() body: CreateSolicitudDto, @Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.solicitudesServiceUrl}/solicitudes`, body, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las solicitudes' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes' })
  async findAll(@Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.solicitudesServiceUrl}/solicitudes`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.solicitudesServiceUrl}/solicitudes/${id}`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar solicitud' })
  @ApiBody({ type: UpdateSolicitudDto })
  @ApiResponse({ status: 200, description: 'Solicitud actualizada' })
  async update(@Param('id') id: string, @Body() body: UpdateSolicitudDto, @Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.put(`${this.solicitudesServiceUrl}/solicitudes/${id}`, body, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud eliminada' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.solicitudesServiceUrl}/solicitudes/${id}`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }
}
