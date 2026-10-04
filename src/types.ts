export type Priority = 'high' | 'medium' | 'low';

export const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low'];

export const CATEGORIES = ['工作', '学习', '生活', '个人'] as const;

export interface User {
  id: string;
  username: string;
  createdAt: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  notes: string;
  category: string;
  priority: Priority;
  /** YYYY-MM-DD，空串表示未设置 */
  dueDate: string;
  done: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface CreateTaskPayload {
  title: string;
  notes?: string;
  category?: string;
  priority?: Priority;
  dueDate?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload> & { done?: boolean };

export type StatusFilter = 'all' | 'todo' | 'done';

export interface TaskFilter {
  status: StatusFilter;
  category: string;
  priority: 'all' | Priority;
  query: string;
}

export const DEFAULT_FILTER: TaskFilter = {
  status: 'all',
  category: 'all',
  priority: 'all',
  query: '',
};
