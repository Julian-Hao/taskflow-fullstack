import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { isProduction } from '../config.js';
import { HttpError } from '../lib/httpError.js';
import { logger } from '../lib/logger.js';

/** 未匹配到任何 API 路由 */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: '接口不存在', code: 'not_found' });
};

/**
 * 全局错误收口：把 Zod 校验错误、业务 HttpError 和未知异常
 * 统一转换成 `{ error, code }` 结构，前端只需要处理一种格式。
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    res.status(400).json({ error: first?.message ?? '请求参数不合法', code: 'validation_error' });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }

  logger.error('未处理的服务端异常', {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.originalUrl,
  });

  res.status(500).json({
    error: isProduction ? '服务器内部错误' : `服务器内部错误：${String(err)}`,
    code: 'internal_error',
  });
};
