// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { getDb } from '../db/index.js';
import { authService } from '../services/authService.js';

beforeEach(() => {
  getDb().exec('DELETE FROM tasks; DELETE FROM sessions; DELETE FROM users;');
});

describe('authService', () => {
  it('注册返回 token 与用户信息，且不泄露任何凭据字段', () => {
    const result = authService.register({ username: 'alice', password: 'secret123' });

    expect(result.token).toMatch(/^[0-9a-f]{64}$/);
    expect(result.user.username).toBe('alice');
    expect(result.user.id).toBeTruthy();
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user).not.toHaveProperty('salt');
  });

  it('用户名重复时报错（大小写不敏感）', () => {
    authService.register({ username: 'bob', password: 'secret123' });

    expect(() => authService.register({ username: 'BOB', password: 'secret123' })).toThrowError(
      /已被注册/,
    );
  });

  it('密码错误与账号不存在返回同样的提示，避免枚举账号', () => {
    authService.register({ username: 'carol', password: 'secret123' });

    const wrongPassword = (): unknown => authService.login({ username: 'carol', password: 'nope-nope' });
    const missingUser = (): unknown => authService.login({ username: 'nobody', password: 'secret123' });

    expect(wrongPassword).toThrowError(/用户名或密码不正确/);
    expect(missingUser).toThrowError(/用户名或密码不正确/);
  });

  it('登录成功后可用 token 换回用户', () => {
    authService.register({ username: 'dave', password: 'secret123' });
    const { token } = authService.login({ username: 'dave', password: 'secret123' });

    expect(authService.resolveSession(token)?.username).toBe('dave');
  });

  it('登出后 token 立即失效', () => {
    const { token } = authService.register({ username: 'erin', password: 'secret123' });

    authService.logout(token);

    expect(authService.resolveSession(token)).toBeNull();
  });

  it('密码以加盐哈希落库，不存明文', () => {
    authService.register({ username: 'frank', password: 'plaintext-secret' });

    const row = getDb()
      .prepare('SELECT password_hash, salt FROM users WHERE username = ?')
      .get('frank') as { password_hash: string; salt: string };

    expect(row.password_hash).not.toContain('plaintext-secret');
    expect(row.password_hash).toHaveLength(128);
    expect(row.salt).toHaveLength(32);
  });

  it('清理过期会话只影响超时的记录', () => {
    const { token } = authService.register({ username: 'grace', password: 'secret123' });

    // 把会话时间改到很久以前，模拟过期
    getDb().prepare('UPDATE sessions SET created_at = 0 WHERE token = ?').run(token);

    expect(authService.purgeExpiredSessions()).toBe(1);
    expect(authService.resolveSession(token)).toBeNull();
  });
});
