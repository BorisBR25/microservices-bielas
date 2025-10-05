import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioController } from './controllers/inventario.controller';
import { HealthController } from './controllers/health.controller';
import { InventarioService } from './services/inventario.service';
import { Producto } from './entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Producto],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Producto]),
  ],
  controllers: [InventarioController, HealthController],
  providers: [InventarioService],
})
export class AppModule {}
