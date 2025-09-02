

import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log('Exception type:', typeof exception);
    console.log('Exception:', exception);

    // 1. Обработка стандартных gRPC ошибок (RpcException с объектом)
    if (this.isGrpcExceptionObject(exception)) {
      const httpStatus = this.mapGrpcCodeToHttpStatus(exception.code);

      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: exception.message,
        details: exception.details || [],
        grpcCode: exception.code
      });
      return;
    }

    // 2. Обработка RpcException со строкой (устаревший формат)
    if (this.isStringRpcException(exception)) {
      // Для обратной совместимости - но лучше такие ошибки тоже структурировать
      response.status(500).json({
        statusCode: 500,
        message: exception.message || 'Internal server error',
      });
      return;
    }

    // 3. Обработка обычных NestJS/HTTP исключений
    if (this.isHttpException(exception)) {
      const errorResponse = exception.getResponse();
      const statusCode = exception.getStatus();

      if (typeof errorResponse === 'object') {
        response.status(statusCode).json({
          statusCode,
          ...errorResponse
        });
      } else {
        response.status(statusCode).json({
          statusCode,
          message: errorResponse
        });
      }
      return;
    }

    // 4. Обработка обычных Error объектов
    if (exception instanceof Error) {
      response.status(500).json({
        statusCode: 500,
        message: exception.message || 'Internal server error',
      });
      return;
    }

    // 5. Любая другая непредвиденная ошибка
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }

  private isGrpcExceptionObject(exception: any): exception is { code: number; message: string; details?: any[] } {
    return (
      exception &&
      typeof exception === 'object' &&
      typeof exception.code === 'number' &&
      typeof exception.message === 'string'
    );
  }

  private isStringRpcException(exception: any): exception is { message: string } {
    return (
      exception &&
      typeof exception === 'object' &&
      typeof exception.message === 'string' &&
      !('code' in exception) // Важно: это НЕ структурированная gRPC ошибка
    );
  }

  private isHttpException(exception: any): exception is { getStatus: () => number; getResponse: () => any } {
    return (
      exception &&
      typeof exception.getStatus === 'function' &&
      typeof exception.getResponse === 'function'
    );
  }

  private mapGrpcCodeToHttpStatus(grpcCode: number): number {
    const mapping: { [key: number]: number } = {
      [status.OK]: 200,
      [status.CANCELLED]: 499,
      [status.INVALID_ARGUMENT]: 400,
      [status.NOT_FOUND]: 404,
      [status.ALREADY_EXISTS]: 409,
      [status.PERMISSION_DENIED]: 403,
      [status.UNAUTHENTICATED]: 401,
      [status.RESOURCE_EXHAUSTED]: 429,
      [status.FAILED_PRECONDITION]: 400,
      [status.ABORTED]: 409,
      [status.OUT_OF_RANGE]: 400,
      [status.UNIMPLEMENTED]: 501,
      [status.INTERNAL]: 500,
      [status.UNAVAILABLE]: 503,
      [status.DATA_LOSS]: 500,
      [status.UNKNOWN]: 500,
    };

    return mapping[grpcCode] || 500;
  }
}
