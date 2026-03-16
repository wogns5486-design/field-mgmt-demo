export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(resource: string): AppError {
  return new AppError(404, 'NOT_FOUND', `${resource}을(를) 찾을 수 없습니다`);
}

export function unauthorized(message = '인증이 필요합니다'): AppError {
  return new AppError(401, 'UNAUTHORIZED', message);
}

export function badRequest(message: string): AppError {
  return new AppError(400, 'BAD_REQUEST', message);
}

export function conflict(message: string): AppError {
  return new AppError(409, 'CONFLICT', message);
}
