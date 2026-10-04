import fs from 'node:fs';
import path from 'node:path';
import express, { type Express } from 'express';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/authRoutes.js';
import { taskRouter } from './routes/taskRoutes.js';

/**
 * 装配 Express 应用。与监听端口解耦，方便测试里直接拿到 app 实例。
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // 访问日志
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      logger.info('http', {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms: Date.now() - startedAt,
      });
    });
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), time: Date.now() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api', notFoundHandler);

  // 若前端已构建，则由同一个进程托管静态资源（单端口部署）
  const indexHtml = path.join(config.staticDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(config.staticDir));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(indexHtml);
    });
  }

  app.use(errorHandler);
  return app;
}
