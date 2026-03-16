import type { ErrorHandler } from 'hono';
import { AppError } from '../lib/errors';
import { ZodError } from 'zod';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.statusCode as any
    );
  }

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: firstIssue?.message || '입력값이 올바르지 않습니다',
          details: err.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
      },
      400
    );
  }

  console.error('[UNHANDLED]', err);
  return c.json(
    { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
    500
  );
};
