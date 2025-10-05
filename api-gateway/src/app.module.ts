import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './controllers/auth.controller';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { PagosController } from './controllers/pagos.controller';
import { InventarioController } from './controllers/inventario.controller';
import { HealthController } from './controllers/health.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  imports: [HttpModule],
  controllers: [
    AuthController,
    SolicitudesController,
    PagosController,
    InventarioController,
    HealthController,
  ],
  providers: [
    JwtAuthGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
