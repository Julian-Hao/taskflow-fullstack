import { create } from 'zustand';

export type ToastType = 'info' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;
const AUTO_DISMISS_MS = 3000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  push: (message, type = 'info') => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS);
  },

  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));

/** 便捷调用（非 hook 场景，如 store 内部） */
export const toast = {
  info: (message: string): void => useToastStore.getState().push(message, 'info'),
  error: (message: string): void => useToastStore.getState().push(message, 'error'),
};
