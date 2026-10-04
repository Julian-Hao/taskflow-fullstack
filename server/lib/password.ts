import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

const KEY_LENGTH = 64;

/** 生成随机盐（hex） */
export function createSalt(): string {
  return randomBytes(16).toString('hex');
}

/** scrypt 加盐哈希，输出 hex */
export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, KEY_LENGTH, { cost: config.scryptCost }).toString('hex');
}

/**
 * 恒定时间比较，避免通过响应时间侧信道推断密码。
 */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
