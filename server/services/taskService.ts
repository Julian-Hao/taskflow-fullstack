import { randomUUID } from 'node:crypto';
import { notFound } from '../lib/httpError.js';
import { taskRepository } from '../repositories/taskRepository.js';
import type { Task } from '../types.js';
import type { CreateTaskInput, UpdateTaskInput } from '../lib/validation.js';

const DEFAULT_CATEGORY = '个人';

export const taskService = {
  list(userId: string): Task[] {
    return taskRepository.listByUser(userId);
  },

  create(userId: string, input: CreateTaskInput): Task {
    const now = Date.now();
    return taskRepository.create({
      id: randomUUID(),
      userId,
      title: input.title,
      notes: input.notes,
      category: input.category.trim() || DEFAULT_CATEGORY,
      priority: input.priority,
      dueDate: input.dueDate,
      done: false,
      createdAt: now,
      updatedAt: now,
    });
  },

  update(userId: string, id: string, patch: UpdateTaskInput): Task {
    const updated = taskRepository.update(id, userId, patch);
    if (!updated) throw notFound('任务不存在');
    return updated;
  },

  remove(userId: string, id: string): void {
    if (!taskRepository.remove(id, userId)) throw notFound('任务不存在');
  },
};
