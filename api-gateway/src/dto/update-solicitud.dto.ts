import { ApiProperty } from '@nestjs/swagger';

export class UpdateSolicitudDto {
  @ApiProperty({
    example: 'procesada',
    description: 'Estado de la solicitud',
    required: false,
  })
  estado?: string;

  @ApiProperty({
    example: 'Actualización de observaciones',
    description: 'Observaciones actualizadas',
    required: false,
  })
  observaciones?: string;
}
