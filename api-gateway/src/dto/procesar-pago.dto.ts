import { ApiProperty } from '@nestjs/swagger';

export class ProcesarPagoDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la solicitud a pagar',
  })
  solicitudId: number;

  @ApiProperty({
    example: 2500,
    description: 'Monto total del pago',
  })
  monto: number;

  @ApiProperty({
    example: 1,
    description: 'ID del producto solicitado',
  })
  productoId: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de productos',
  })
  cantidad: number;

  @ApiProperty({
    example: 'admin@bielas.com',
    description: 'Email del usuario para enviar notificación',
  })
  userEmail: string;
}
