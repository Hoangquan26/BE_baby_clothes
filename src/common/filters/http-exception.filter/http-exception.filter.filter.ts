import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus
} from '@nestjs/common';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const requestId = req.id || req.headers['x-request-id'];
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;

      message = response?.message || response || exception.message || message;

      // map status -> code
      switch (status) {
        case HttpStatus.BAD_REQUEST: code = 'BAD_REQUEST'; break;
        case HttpStatus.UNAUTHORIZED: code = 'UNAUTHORIZED'; break;
        case HttpStatus.FORBIDDEN: code = 'FORBIDDEN'; break;
        case HttpStatus.NOT_FOUND: code = 'NOT_FOUND'; break;
        case HttpStatus.CONFLICT: code = 'CONFLICT'; break;
        case HttpStatus.UNPROCESSABLE_ENTITY: code = 'UNPROCESSABLE_ENTITY'; break;
        default: code = HttpStatus[status] ?? code;
      }

      if (typeof response === 'object') {
        details = { ...(response.errors && { errors: response.errors }), ...(response?.details && { details: response.details })};
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
      details = process.env.NODE_ENV === 'production' ? undefined : { stack: exception.stack };
    }

    const payload = {
      status: 'error',
      error: { code, message, ...(details ? { details } : {}) },
      ...(requestId ? { requestId } : {}),
    };

    res.status(status).json(payload);
  }
}
