import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PagosController } from './controllers/pagos.controller';
import { FacturasController } from './controllers/facturas.controller';
import { HealthController } from './controllers/health.controller';
import { PagosService } from './services/pagos.service';
import { Pago } from './entities/pago.entity';
import { Factura } from './entities/factura.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Pago, Factura],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Pago, Factura]),
    HttpModule,
  ],
  controllers: [PagosController, FacturasController, HealthController],
  providers: [PagosService],
})
export class AppModule {}
