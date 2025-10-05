import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { InventarioService } from '../services/inventario.service';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get()
  async findAll() {
    return this.inventarioService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inventarioService.findOne(+id);
  }

  @Put(':id/actualizar')
  async actualizarStock(@Param('id') id: string, @Body() body: { cantidad: number }) {
    return this.inventarioService.actualizarStock(+id, body.cantidad);
  }
}
