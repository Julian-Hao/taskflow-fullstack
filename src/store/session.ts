import { setToken } from '../lib/api';

type Listener = () => void;

const listeners = new Set<Listener>();

/** 注册「登录已过期」监听者，返回取消注册函数 */
export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * 任意请求收到 401 时调用：清掉本地 token 并通知上层回到登录态。
 * 独立成模块是为了让 store 之间不必互相 import，避免循环依赖。
 */
export function emitSessionExpired(): void {
  setToken(null);
  listeners.forEach((listener) => listener());
}
