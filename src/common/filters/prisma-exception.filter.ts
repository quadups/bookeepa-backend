import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = this.mapException(exception);
    const status = mapped.getStatus();
    const body = mapped.getResponse();

    response.status(status).json(
      typeof body === 'string'
        ? {
            statusCode: status,
            message: body,
          }
        : body,
    );
  }

  private mapException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ConflictException | NotFoundException {
    if (exception.code === 'P2025') {
      return new NotFoundException('The requested record was not found.');
    }

    if (exception.code === 'P2002') {
      const target = Array.isArray(exception.meta?.target)
        ? exception.meta.target.join(', ')
        : 'unique field';

      return new ConflictException(`A record already exists for ${target}.`);
    }

    if (exception.code === 'P2003') {
      return new ConflictException('The request references an invalid record.');
    }

    return new ConflictException('The database rejected this request.');
  }
}
