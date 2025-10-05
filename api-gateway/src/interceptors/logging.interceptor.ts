import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API-GATEWAY');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip;

    // Determinar a qué microservicio se redirige
    let targetService = 'Unknown';
    if (url.startsWith('/auth')) {
      targetService = 'Auth Service';
    } else if (url.startsWith('/solicitudes')) {
      targetService = 'Solicitudes Service';
    } else if (url.startsWith('/pagos')) {
      targetService = 'Pagos Service';
    } else if (url.startsWith('/inventario')) {
      targetService = 'Inventario Service';
    } else if (url.startsWith('/health')) {
      targetService = 'Health Check';
    }

    this.logger.log(
      `🔀 Redirigiendo → [${targetService}] ${method} ${url} | IP: ${ip} | Agent: ${userAgent.substring(0, 50)}`,
    );

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const duration = Date.now() - now;

        this.logger.log(
          `✅ Respuesta ← [${targetService}] ${method} ${url} | Status: ${statusCode} | Tiempo: ${duration}ms`,
        );
      }),
    );
  }
}
