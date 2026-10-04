import { Router } from 'express';
import { createTaskSchema, updateTaskSchema } from '../lib/validation.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { taskService } from '../services/taskService.js';

export const taskRouter = Router();

// 整个任务模块都需要登录
taskRouter.use(requireAuth);

taskRouter.get('/', (req, res) => {
  res.json({ tasks: taskService.list(req.user!.id) });
});

taskRouter.post('/', (req, res) => {
  const input = createTaskSchema.parse(req.body);
  res.status(201).json({ task: taskService.create(req.user!.id, input) });
});

taskRouter.patch('/:id', (req, res) => {
  const patch = updateTaskSchema.parse(req.body);
  res.json({ task: taskService.update(req.user!.id, req.params.id, patch) });
});

taskRouter.delete('/:id', (req, res) => {
  taskService.remove(req.user!.id, req.params.id);
  res.json({ ok: true });
});
