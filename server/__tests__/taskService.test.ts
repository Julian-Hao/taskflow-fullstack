// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { getDb } from '../db/index.js';
import { authService } from '../services/authService.js';
import { taskService } from '../services/taskService.js';

let aliceId: string;
let bobId: string;

beforeEach(() => {
  getDb().exec('DELETE FROM tasks; DELETE FROM sessions; DELETE FROM users;');
  aliceId = authService.register({ username: 'alice', password: 'secret123' }).user.id;
  bobId = authService.register({ username: 'bob', password: 'secret123' }).user.id;
});

const baseInput = { title: '写周报', notes: '', category: '', priority: 'medium' as const, dueDate: '' };

describe('taskService', () => {
  it('创建任务：分类为空时落到默认分类，且初始为未完成', () => {
    const task = taskService.create(aliceId, baseInput);

    expect(task.category).toBe('个人');
    expect(task.done).toBe(false);
    expect(task.userId).toBe(aliceId);
    expect(task.createdAt).toBe(task.updatedAt);
  });

  it('保留传入的分类与优先级', () => {
    const task = taskService.create(aliceId, {
      ...baseInput,
      category: '工作',
      priority: 'high',
      dueDate: '2026-10-05',
    });

    expect(task.category).toBe('工作');
    expect(task.priority).toBe('high');
    expect(task.dueDate).toBe('2026-10-05');
  });

  it('列表按「未完成优先、创建时间倒序」排序', () => {
    const first = taskService.create(aliceId, { ...baseInput, title: '第一件' });
    const second = taskService.create(aliceId, { ...baseInput, title: '第二件' });
    taskService.update(aliceId, first.id, { done: true });

    const titles = taskService.list(aliceId).map((t) => t.title);

    expect(titles).toEqual(['第二件', '第一件']);
    expect(second.id).toBeTruthy();
  });

  it('任务按用户隔离：看不到别人的任务', () => {
    taskService.create(aliceId, { ...baseInput, title: 'Alice 的私事' });

    expect(taskService.list(bobId)).toHaveLength(0);
    expect(taskService.list(aliceId)).toHaveLength(1);
  });

  it('跨用户更新/删除他人任务会被拒绝', () => {
    const task = taskService.create(aliceId, baseInput);

    expect(() => taskService.update(bobId, task.id, { done: true })).toThrowError(/任务不存在/);
    expect(() => taskService.remove(bobId, task.id)).toThrowError(/任务不存在/);
  });

  it('局部更新只改传入的字段', () => {
    const task = taskService.create(aliceId, { ...baseInput, title: '原标题', notes: '原备注' });

    const updated = taskService.update(aliceId, task.id, { done: true });

    expect(updated.done).toBe(true);
    expect(updated.title).toBe('原标题');
    expect(updated.notes).toBe('原备注');
    expect(updated.updatedAt).toBeGreaterThanOrEqual(task.updatedAt);
  });

  it('删除后任务不再出现在列表中', () => {
    const task = taskService.create(aliceId, baseInput);

    taskService.remove(aliceId, task.id);

    expect(taskService.list(aliceId)).toHaveLength(0);
  });

  it('空 patch 不会破坏原记录', () => {
    const task = taskService.create(aliceId, baseInput);

    const updated = taskService.update(aliceId, task.id, {});

    expect(updated.title).toBe(task.title);
    expect(updated.done).toBe(false);
  });
});
