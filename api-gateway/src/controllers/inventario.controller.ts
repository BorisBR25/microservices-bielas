import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Inventario')
@Controller('inventario')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InventarioController {
  private readonly inventarioServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.inventarioServiceUrl = process.env.INVENTARIO_SERVICE_URL || 'http://localhost:3004';
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos en inventario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos',
    schema: {
      example: [
        {
          id: 1,
          nombre: 'Biela Motor V8',
          codigo: 'BIE-V8-001',
          stock: 100,
          precio: 250.00,
          descripcion: 'Biela para motor V8 alta resistencia'
        }
      ]
    }
  })
  async findAll(@Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventarioServiceUrl}/inventario`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto específico por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventarioServiceUrl}/inventario/${id}`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }
}
