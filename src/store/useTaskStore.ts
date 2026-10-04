import { create } from 'zustand';
import { ApiError, api } from '../lib/api';
import { DEFAULT_FILTER, type CreateTaskPayload, type Task, type TaskFilter, type UpdateTaskPayload } from '../types';
import { emitSessionExpired } from './session';
import { toast } from './useToastStore';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  loading: boolean;

  load: () => Promise<void>;
  add: (payload: CreateTaskPayload) => Promise<boolean>;
  toggle: (id: string) => Promise<void>;
  edit: (id: string, patch: UpdateTaskPayload) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  setFilter: (patch: Partial<TaskFilter>) => void;
  resetFilter: () => void;
  reset: () => void;
}

/** 统一处理接口异常：401 触发登录过期，其余弹 toast */
function handleError(err: unknown, fallback: string): void {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      emitSessionExpired();
      return;
    }
    toast.error(err.message);
    return;
  }
  toast.error(fallback);
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filter: DEFAULT_FILTER,
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const { tasks } = await api.listTasks();
      set({ tasks, loading: false });
    } catch (err) {
      set({ loading: false });
      handleError(err, '加载任务失败');
    }
  },

  add: async (payload) => {
    try {
      const { task } = await api.createTask(payload);
      set((state) => ({ tasks: [task, ...state.tasks] }));
      return true;
    } catch (err) {
      handleError(err, '添加任务失败');
      return false;
    }
  },

  toggle: async (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) return;

    // 乐观更新，失败时回滚
    const optimistic = { ...task, done: !task.done };
    set((state) => ({ tasks: state.tasks.map((item) => (item.id === id ? optimistic : item)) }));

    try {
      const { task: updated } = await api.updateTask(id, { done: optimistic.done });
      set((state) => ({ tasks: state.tasks.map((item) => (item.id === id ? updated : item)) }));
    } catch (err) {
      set((state) => ({ tasks: state.tasks.map((item) => (item.id === id ? task : item)) }));
      handleError(err, '更新任务失败');
    }
  },

  edit: async (id, patch) => {
    try {
      const { task: updated } = await api.updateTask(id, patch);
      set((state) => ({ tasks: state.tasks.map((item) => (item.id === id ? updated : item)) }));
      return true;
    } catch (err) {
      handleError(err, '保存失败');
      return false;
    }
  },

  remove: async (id) => {
    try {
      await api.deleteTask(id);
      set((state) => ({ tasks: state.tasks.filter((item) => item.id !== id) }));
      toast.info('已删除任务');
    } catch (err) {
      handleError(err, '删除失败');
    }
  },

  setFilter: (patch) => set((state) => ({ filter: { ...state.filter, ...patch } })),

  resetFilter: () => set({ filter: DEFAULT_FILTER }),

  reset: () => set({ tasks: [], filter: DEFAULT_FILTER, loading: false }),
}));
