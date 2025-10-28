import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundException)
export class NotfoundFilterFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const statusCode = exception?.getStatus?.() ?? 404;
    const message = exception?.message ?? 'Khong tim thay';

    const response: Response = http.getResponse();

    return response.status(statusCode).json({
      message,
      statusCode,
      error: 'API khong ton tai',
    });
  }
}
