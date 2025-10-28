import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

interface ValidationErrorResponse {
  message?: string | string[];
  error?: string;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response: Response = http.getResponse();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse() as ValidationErrorResponse | string;

    let details: string[] = [];
    if (typeof exceptionResponse === 'string') {
      details = [exceptionResponse];
    } else if (Array.isArray(exceptionResponse?.message)) {
      details = exceptionResponse.message;
    } else if (typeof exceptionResponse?.message === 'string') {
      details = [exceptionResponse.message];
    }

    return response.status(statusCode).json({
      statusCode,
      error: 'ValidationError',
      message: 'Payload validation failed',
      details,
    });
  }
}
