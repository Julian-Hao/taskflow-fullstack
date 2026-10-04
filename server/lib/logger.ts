type Level = 'info' | 'warn' | 'error';

type Meta = Record<string, unknown>;

function emit(level: Level, message: string, meta?: Meta): void {
  // 测试环境不输出 info 日志，避免淹没断言结果
  if (process.env.NODE_ENV === 'test' && level === 'info') return;

  const line = JSON.stringify({ ts: new Date().toISOString(), level, message, ...meta });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

/** 结构化日志：每行一条 JSON，方便被日志系统直接采集 */
export const logger = {
  info: (message: string, meta?: Meta) => emit('info', message, meta),
  warn: (message: string, meta?: Meta) => emit('warn', message, meta),
  error: (message: string, meta?: Meta) => emit('error', message, meta),
};
