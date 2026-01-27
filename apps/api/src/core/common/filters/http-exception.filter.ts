import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 🔒 Global Exception Filter
 *
 * يحمي من تسريب معلومات حساسة في Production
 * - يخفي تفاصيل الأخطاء في Production
 * - يسجل جميع الأخطاء للتحليل
 * - يعرض رسائل آمنة للمستخدمين
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // الحصول على رسالة الخطأ
    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message || 'An error occurred';

    // 🔒 في Production، إرجاع رسائل عامة فقط
    const safeMessage = this.isProduction
      ? this.getSafeMessage(status, message)
      : message;

    // بناء response آمن
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(safeMessage) ? safeMessage : [safeMessage],
      // 🔒 في Development فقط، إضافة تفاصيل إضافية
      ...(!this.isProduction && {
        error:
          exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // تسجيل الخطأ
    // 🔕 401/403 on auth routes are expected for unauthenticated users - skip logging entirely
    const logPayload = {
      statusCode: status,
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message.join(', ') : message,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      user: (request as any).user?.id,
      ip: request.ip || request.socket.remoteAddress,
      userAgent: request.get('User-Agent'),
    };

    // Skip logging entirely for expected auth failures on auth endpoints
    const isAuthEndpoint = request.url.includes('/auth/');
    const isExpectedAuthFailure =
      (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) &&
      isAuthEndpoint;

    if (isExpectedAuthFailure) {
      // Silently skip - these are expected for unauthenticated users
    } else if (
      status === HttpStatus.UNAUTHORIZED ||
      status === HttpStatus.FORBIDDEN
    ) {
      // Non-auth endpoint auth failures might be interesting
      this.logger.debug(logPayload);
    } else {
      this.logger.error(logPayload);
    }

    response.status(status).json(errorResponse);
  }

  /**
   * 🔒 إرجاع رسائل آمنة في Production
   */
  private getSafeMessage(
    status: number,
    originalMessage: string | string[],
  ): string | string[] {
    // رسائل التحقق من الصحة يمكن عرضها
    if (
      status === HttpStatus.BAD_REQUEST ||
      status === HttpStatus.UNPROCESSABLE_ENTITY
    ) {
      return originalMessage;
    }

    // رسائل عامة للأنواع الأخرى من الأخطاء
    const safeMessages: Record<number, string> = {
      [HttpStatus.UNAUTHORIZED]: 'Authentication required',
      [HttpStatus.FORBIDDEN]: 'Access denied',
      [HttpStatus.NOT_FOUND]: 'Resource not found',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'Method not allowed',
      [HttpStatus.CONFLICT]: 'Conflict occurred',
      [HttpStatus.TOO_MANY_REQUESTS]:
        'Too many requests, please try again later',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal server error',
      [HttpStatus.BAD_GATEWAY]: 'Bad gateway',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service unavailable',
    };

    return safeMessages[status] || 'An error occurred';
  }
}
