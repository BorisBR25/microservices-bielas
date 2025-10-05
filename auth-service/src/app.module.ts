import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { HealthController } from './controllers/health.controller';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User],
      synchronize: true, // Solo para desarrollo
      logging: false,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController, UsersController, HealthController],
  providers: [AuthService, UsersService],
})
export class AppModule {}
