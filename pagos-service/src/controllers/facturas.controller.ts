import { Controller, Get, Param } from '@nestjs/common';
import { PagosService } from '../services/pagos.service';

@Controller('facturas')
export class FacturasController {
  constructor(private readonly pagosService: PagosService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pagosService.findFactura(+id);
  }
}
