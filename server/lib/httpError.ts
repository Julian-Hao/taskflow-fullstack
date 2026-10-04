/**
 * 统一的 HTTP 错误类型。路由层只负责抛出，响应格式由 errorHandler 统一收口。
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, message: string, code = 'error') {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message: string, code = 'bad_request'): HttpError =>
  new HttpError(400, message, code);

export const unauthorized = (message = '未登录或登录已过期', code = 'unauthorized'): HttpError =>
  new HttpError(401, message, code);

export const forbidden = (message = '没有权限执行该操作', code = 'forbidden'): HttpError =>
  new HttpError(403, message, code);

export const notFound = (message = '资源不存在', code = 'not_found'): HttpError =>
  new HttpError(404, message, code);

export const conflict = (message: string, code = 'conflict'): HttpError =>
  new HttpError(409, message, code);
