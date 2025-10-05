import { ApiProperty } from '@nestjs/swagger';

export class CreateSolicitudDto {
  @ApiProperty({
    example: 1,
    description: 'ID del producto a solicitar',
  })
  productoId: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de unidades a solicitar',
  })
  cantidad: number;

  @ApiProperty({
    example: 'Automotriz XYZ S.A.',
    description: 'Nombre de la empresa solicitante',
  })
  empresa: string;

  @ApiProperty({
    example: 'Entrega urgente para producción',
    description: 'Observaciones adicionales',
    required: false,
  })
  observaciones?: string;
}
