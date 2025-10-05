import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@bielas.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    example: 'Admin123!',
    description: 'Contraseña del usuario',
  })
  password: string;
}
