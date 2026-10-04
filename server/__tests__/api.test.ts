// @vitest-environment node
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { getDb } from '../db/index.js';

const app = createApp();

beforeEach(() => {
  getDb().exec('DELETE FROM tasks; DELETE FROM sessions; DELETE FROM users;');
});

async function registerUser(username = 'api_user'): Promise<string> {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, password: 'secret123' });
  return res.body.token as string;
}

describe('HTTP API', () => {
  it('GET /api/health 返回 ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('未携带 token 访问任务接口返回 401', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('unauthorized');
  });

  it('伪造 token 返回 401', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', 'Bearer deadbeef');

    expect(res.status).toBe(401);
  });

  it('注册 → 创建任务 → 列表 全链路可用', async () => {
    const token = await registerUser();

    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '写周报', category: '工作', priority: 'high' });

    expect(created.status).toBe(201);
    expect(created.body.task.title).toBe('写周报');

    const list = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.tasks).toHaveLength(1);
  });

  it('参数校验失败返回 400 且带可读提示', async () => {
    const token = await registerUser();

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('validation_error');
    expect(res.body.error).toContain('标题');
  });

  it('非法优先级被拒绝', async () => {
    const token = await registerUser();

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '任务', priority: 'urgent' });

    expect(res.status).toBe(400);
  });

  it('重复注册返回 409', async () => {
    await registerUser('dup_user');

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'dup_user', password: 'secret123' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('username_taken');
  });

  it('登录失败返回 401', async () => {
    await registerUser('login_user');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'login_user', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('invalid_credentials');
  });

  it('跨用户操作他人任务返回 404', async () => {
    const tokenA = await registerUser('user_a');
    const tokenB = await registerUser('user_b');

    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'A 的任务' });
    const taskId = created.body.task.id as string;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ done: true });

    expect(res.status).toBe(404);
  });

  it('登出后 token 失效', async () => {
    const token = await registerUser('logout_user');

    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`).expect(200);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it('未知 API 路径返回 404 JSON', async () => {
    const res = await request(app).get('/api/not-exist');

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('not_found');
  });
});
