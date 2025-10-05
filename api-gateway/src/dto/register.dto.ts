import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    example: 'MiPassword123!',
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
  })
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  nombre: string;

  @ApiProperty({
    example: 'cliente',
    description: 'Rol del usuario (admin o cliente)',
    required: false,
  })
  rol?: string;
}
