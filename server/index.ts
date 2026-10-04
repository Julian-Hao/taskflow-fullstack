import { createApp } from './app.js';
import { config } from './config.js';
import { closeDb, getDb } from './db/index.js';
import { logger } from './lib/logger.js';
import { authService } from './services/authService.js';

// 启动即完成建表与连接初始化
getDb();

const purged = authService.purgeExpiredSessions();
if (purged > 0) logger.info('已清理过期会话', { count: purged });

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  logger.info('TaskFlow 服务已启动', {
    url: `http://${config.host}:${config.port}`,
    env: config.env,
    db: config.dbFile,
  });
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info('收到退出信号，正在优雅关闭', { signal });
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
