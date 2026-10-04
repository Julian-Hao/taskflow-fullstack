import { create } from 'zustand';
import { ApiError, api, getToken, setToken } from '../lib/api';
import type { User } from '../types';
import { toast } from './useToastStore';

interface AuthState {
  user: User | null;
  /** 首次挂载时的会话恢复是否已完成 */
  bootstrapped: boolean;
  pending: boolean;
  error: string | null;

  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: (silent?: boolean) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  bootstrapped: false,
  pending: false,
  error: null,

  /** 用本地 token 尝试恢复登录态；失败则清掉 token */
  bootstrap: async () => {
    if (!getToken()) {
      set({ bootstrapped: true });
      return;
    }

    try {
      const { user } = await api.me();
      set({ user, bootstrapped: true });
    } catch {
      setToken(null);
      set({ user: null, bootstrapped: true });
    }
  },

  login: async (username, password) => {
    set({ pending: true, error: null });
    try {
      const { token, user } = await api.login(username, password);
      setToken(token);
      set({ user, pending: false });
      return true;
    } catch (err) {
      set({ pending: false, error: err instanceof ApiError ? err.message : '登录失败，请重试' });
      return false;
    }
  },

  register: async (username, password) => {
    set({ pending: true, error: null });
    try {
      const { token, user } = await api.register(username, password);
      setToken(token);
      set({ user, pending: false });
      return true;
    } catch (err) {
      set({ pending: false, error: err instanceof ApiError ? err.message : '注册失败，请重试' });
      return false;
    }
  },

  logout: async (silent = false) => {
    try {
      await api.logout();
    } catch {
      /* 登出失败也要清掉本地状态 */
    }
    setToken(null);
    set({ user: null, error: null });
    if (!silent) toast.info('已退出登录');
  },

  clearError: () => set({ error: null }),
}));
