export type Priority = 'high' | 'medium' | 'low';

export const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low'];

/** 对外暴露的用户信息（不含任何凭据字段） */
export interface User {
  id: string;
  username: string;
  createdAt: number;
}

/** 数据库中的完整用户记录，仅在服务端内部流转 */
export interface UserRecord extends User {
  passwordHash: string;
  salt: string;
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
