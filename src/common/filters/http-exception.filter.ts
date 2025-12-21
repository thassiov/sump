import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  PermissionError,
} from '../../lib/errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: object = { message: 'Internal server error' };

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      body =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : exceptionResponse;
    }
    // Handle custom application errors
    else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      body = {
        message: 'Validation failed',
        context: exception.context,
        errors: exception.details,
      };
    } else if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      body = {
        message: 'Resource not found',
        context: exception.context,
        details: exception.details,
      };
    } else if (exception instanceof ConflictError) {
      status = HttpStatus.CONFLICT;
      body = {
        message: 'Conflict',
        context: exception.context,
        errors: exception.details,
      };
    } else if (exception instanceof PermissionError) {
      status = HttpStatus.FORBIDDEN;
      body = {
        message: 'Permission denied',
        context: exception.context,
      };
    } else if (exception instanceof Error) {
      // Log unexpected errors
      console.error('Unhandled exception:', exception);
      body = {
        message: 'Internal server error',
        ...(process.env['NODE_ENV'] !== 'production' && {
          error: exception.message,
        }),
      };
    }

    response.status(status).json(body);
  }
}
