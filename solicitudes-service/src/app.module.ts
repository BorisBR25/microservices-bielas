import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { HealthController } from './controllers/health.controller';
import { SolicitudesService } from './services/solicitudes.service';
import { Solicitud } from './entities/solicitud.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Solicitud],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Solicitud]),
    HttpModule,
  ],
  controllers: [SolicitudesController, HealthController],
  providers: [SolicitudesService],
})
export class AppModule {}
