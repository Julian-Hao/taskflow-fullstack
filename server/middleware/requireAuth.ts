import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { unauthorized } from '../lib/httpError.js';
import { authService } from '../services/authService.js';

/** 从 Authorization 头里取出 Bearer token */
export function extractToken(req: Request): string {
  const header = req.header('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

/**
 * 鉴权中间件：校验 token 并把用户挂到 req 上。
 * 未通过一律 401，由 errorHandler 统一格式化。
 */
export const requireAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  const user = token ? authService.resolveSession(token) : null;

  if (!user) {
    next(unauthorized());
    return;
  }

  req.user = user;
  req.token = token;
  next();
};
