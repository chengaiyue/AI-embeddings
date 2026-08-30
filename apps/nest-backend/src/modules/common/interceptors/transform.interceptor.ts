import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 统一响应包装：{ code, data, timestamp }（SSE/文件流路由会自动跳过） */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isSse = _context.switchToHttp().getResponse().getHeaders()['content-type']?.includes('text/event-stream');
    if (isSse) return next.handle();

    return next.handle().pipe(
      map((data) => ({
        code: 0,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
