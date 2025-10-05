import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Configuración de Swagger centralizado
  const config = new DocumentBuilder()
    .setTitle('Sistema de Microservicios - Fabricación de Bielas')
    .setDescription('API Gateway centralizada para gestión de solicitudes, pagos e inventario de bielas')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese su token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Endpoints de autenticación y gestión de usuarios')
    .addTag('Solicitudes', 'Gestión de solicitudes de bielas')
    .addTag('Pagos', 'Procesamiento de pagos y facturación')
    .addTag('Inventario', 'Gestión de stock de productos')
    .addTag('Health', 'Health checks del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API Gateway ejecutándose en http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
