import { randomBytes, randomUUID } from 'node:crypto';
import { config } from '../config.js';
import { conflict, unauthorized } from '../lib/httpError.js';
import { createSalt, hashPassword, verifyPassword } from '../lib/password.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import type { AuthResult, User, UserRecord } from '../types.js';
import type { LoginInput, RegisterInput } from '../lib/validation.js';

function toPublicUser(record: UserRecord): User {
  return { id: record.id, username: record.username, createdAt: record.createdAt };
}

function issueToken(userId: string): string {
  const token = randomBytes(32).toString('hex');
  sessionRepository.create(token, userId, Date.now());
  return token;
}

export const authService = {
  register(input: RegisterInput): AuthResult {
    if (userRepository.findByUsername(input.username)) {
      throw conflict('该用户名已被注册', 'username_taken');
    }

    const salt = createSalt();
    const user = userRepository.create({
      id: randomUUID(),
      username: input.username,
      salt,
      passwordHash: hashPassword(input.password, salt),
      createdAt: Date.now(),
    });

    return { token: issueToken(user.id), user };
  },

  login(input: LoginInput): AuthResult {
    const record = userRepository.findByUsername(input.username);

    // 用户不存在与密码错误返回同一提示，避免暴露账号是否注册
    if (!record || !verifyPassword(input.password, record.salt, record.passwordHash)) {
      throw unauthorized('用户名或密码不正确', 'invalid_credentials');
    }

    const user = toPublicUser(record);
    return { token: issueToken(user.id), user };
  },

  /** 用 token 换用户；token 不存在或已过期返回 null */
  resolveSession(token: string): User | null {
    const userId = sessionRepository.findUserId(token);
    if (!userId) return null;
    return userRepository.findById(userId);
  },

  logout(token: string): void {
    sessionRepository.delete(token);
  },

  /** 清理过期会话（由定时任务或启动时调用） */
  purgeExpiredSessions(): number {
    return sessionRepository.deleteExpired(Date.now(), config.sessionTtlHours * 60 * 60 * 1000);
  },
};
