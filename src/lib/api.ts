import type { AuthResult, CreateTaskPayload, Task, UpdateTaskPayload, User } from '../types';

const TOKEN_KEY = 'taskflow.token';

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* 隐私模式下 localStorage 不可写，忽略即可 */
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, '网络连接失败，请检查网络后重试', 'network_error');
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const data = (payload ?? {}) as { error?: string; code?: string };
    throw new ApiError(response.status, data.error ?? `请求失败（${response.status}）`, data.code);
  }

  return payload as T;
}

export const api = {
  register: (username: string, password: string) =>
    request<AuthResult>('/api/auth/register', {
      method: 'POST',
      body: { username, password },
      auth: false,
    }),

  login: (username: string, password: string) =>
    request<AuthResult>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
      auth: false,
    }),

  me: () => request<{ user: User }>('/api/auth/me'),

  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  listTasks: () => request<{ tasks: Task[] }>('/api/tasks'),

  createTask: (payload: CreateTaskPayload) =>
    request<{ task: Task }>('/api/tasks', { method: 'POST', body: payload }),

  updateTask: (id: string, payload: UpdateTaskPayload) =>
    request<{ task: Task }>(`/api/tasks/${id}`, { method: 'PATCH', body: payload }),

  deleteTask: (id: string) => request<{ ok: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),
};
