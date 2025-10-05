import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { firstValueFrom } from 'rxjs';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly httpService: HttpService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check del API Gateway y todos los servicios' })
  @ApiResponse({
    status: 200,
    description: 'Estado de salud del sistema',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00.000Z',
        services: {
          'auth-service': 'healthy',
          'solicitudes-service': 'healthy',
          'pagos-service': 'healthy',
          'inventario-service': 'healthy'
        }
      }
    }
  })
  async check() {
    const services = {
      'auth-service': process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      'solicitudes-service': process.env.SOLICITUDES_SERVICE_URL || 'http://localhost:3002',
      'pagos-service': process.env.PAGOS_SERVICE_URL || 'http://localhost:3003',
      'inventario-service': process.env.INVENTARIO_SERVICE_URL || 'http://localhost:3004',
    };

    const healthChecks = {};

    for (const [name, url] of Object.entries(services)) {
      try {
        await firstValueFrom(this.httpService.get(`${url}/health`, { timeout: 5000 }));
        healthChecks[name] = 'healthy';
      } catch (error) {
        healthChecks[name] = 'unhealthy';
      }
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: healthChecks,
    };
  }
}
