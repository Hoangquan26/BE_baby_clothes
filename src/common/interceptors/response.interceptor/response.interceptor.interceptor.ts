import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { NO_WRAP_KEY } from 'src/common/decorators/no-wrap/no-wrap.decorator';
import { OkResponse } from 'src/common/http/response.type';

@Injectable()
export class ResponseInterceptorInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const isNoWrap = this.reflector.get<boolean>(NO_WRAP_KEY, context.getHandler())
    const requestId = req.id || req.headers['x-request-id'];
    return next.handle().pipe((
      map((body) => {
        if(
          isNoWrap ||
          body instanceof StreamableFile ||
          Buffer.isBuffer(body) || 
          (body && body.status === 'ok') ||
          (body && body.status === 'error')
        ) {
          return body
        }

        const payload: OkResponse = {
          status: 'ok',
          data: body?.data ?? body,
          ...(body?.meta ? { meta: body.meta } : {}),
          ...(requestId ? { requestId } : {}),
        }
        return payload
      })
    ));
  }
}
