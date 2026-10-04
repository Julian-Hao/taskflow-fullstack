import { Router } from 'express';
import { loginSchema, registerSchema } from '../lib/validation.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { authService } from '../services/authService.js';

export const authRouter = Router();

authRouter.post('/register', (req, res) => {
  const input = registerSchema.parse(req.body);
  res.status(201).json(authService.register(input));
});

authRouter.post('/login', (req, res) => {
  const input = loginSchema.parse(req.body);
  res.json(authService.login(input));
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.post('/logout', requireAuth, (req, res) => {
  authService.logout(req.token as string);
  res.json({ ok: true });
});
