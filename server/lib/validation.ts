import { z } from 'zod';

const username = z
  .string()
  .trim()
  .min(3, '用户名需为 3–20 个字符')
  .max(20, '用户名需为 3–20 个字符')
  .regex(/^[\w\u4e00-\u9fa5.-]+$/, '用户名仅支持中英文、数字、下划线');

const password = z.string().min(6, '密码至少 6 位').max(72, '密码最多 72 位');

export const registerSchema = z.object({ username, password });

export const loginSchema = z.object({
  username: z.string().trim().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
});

const title = z.string().trim().min(1, '任务标题不能为空').max(120, '任务标题最多 120 字');
const notes = z.string().trim().max(500, '备注最多 500 字');
const category = z.string().trim().max(12, '分类最多 12 字');
const priority = z.enum(['high', 'medium', 'low'], { message: '优先级取值不合法' });
const dueDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD');

export const createTaskSchema = z.object({
  title,
  notes: notes.optional().default(''),
  category: category.optional().default(''),
  priority: priority.optional().default('medium'),
  dueDate: dueDate.or(z.literal('')).optional().default(''),
});

export const updateTaskSchema = z.object({
  title: title.optional(),
  notes: notes.optional(),
  category: category.optional(),
  priority: priority.optional(),
  dueDate: dueDate.or(z.literal('')).optional(),
  done: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
