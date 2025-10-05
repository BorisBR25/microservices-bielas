import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'healthy',
      service: 'pagos-service',
      timestamp: new Date().toISOString(),
    };
  }
}
