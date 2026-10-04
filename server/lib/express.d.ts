import type { User } from '../types.js';

/**
 * 扩展 Express 的 Request，挂载鉴权后解析出的用户与原始 token。
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

export {};
