import path from 'node:path';

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const root = process.cwd();

/**
 * 集中式配置。所有可调参数都走环境变量，默认值面向本地开发。
 */
export const config = {
  env: process.env.NODE_ENV ?? 'development',
  host: process.env.HOST ?? '0.0.0.0',
  port: positiveInt(process.env.PORT, 3000),
  /** SQLite 文件路径；设为 ':memory:' 可跑纯内存实例（测试用） */
  dbFile: process.env.DB_FILE ?? path.join(root, 'data', 'taskflow.db'),
  /** 前端构建产物目录，生产模式下由 Express 托管 */
  staticDir: process.env.STATIC_DIR ?? path.join(root, 'dist'),
  /** 会话有效期（小时） */
  sessionTtlHours: positiveInt(process.env.SESSION_TTL_HOURS, 24 * 30),
  /** 密码哈希强度参数 */
  scryptCost: positiveInt(process.env.SCRYPT_COST, 16384),
} as const;

export const isProduction = config.env === 'production';
