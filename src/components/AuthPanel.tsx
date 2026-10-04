import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../store/useAuthStore';

type Mode = 'login' | 'register';

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const pending = useAuthStore((state) => state.pending);
  const serverError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const isRegister = mode === 'register';
  const message = localError ?? serverError;

  function switchMode(next: Mode) {
    setMode(next);
    setLocalError(null);
    clearError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (isRegister && password !== confirm) {
      setLocalError('两次输入的密码不一致');
      return;
    }

    const name = username.trim();
    const ok = isRegister ? await register(name, password) : await login(name, password);

    if (ok) {
      setUsername('');
      setPassword('');
      setConfirm('');
    }
  }

  return (
    <div className="auth-view">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="30" height="30">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path
                d="M9 16.5l4.5 4.5L23 11.5"
                stroke="#fff"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h1>TaskFlow</h1>
            <p className="brand-sub">把要做的事，一件件理清楚</p>
          </div>
        </div>

        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            className={`tab${!isRegister ? ' active' : ''}`}
            onClick={() => switchMode('login')}
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            className={`tab${isRegister ? ' active' : ''}`}
            onClick={() => switchMode('register')}
          >
            注册
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">用户名</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="3–20 个字符"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">密码</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 6 位"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />
          </label>

          {isRegister && (
            <label className="field">
              <span className="field-label">确认密码</span>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="再输入一次密码"
                autoComplete="new-password"
              />
            </label>
          )}

          {message && (
            <p className="form-error" role="alert">
              {message}
            </p>
          )}

          <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
            {pending ? (isRegister ? '注册中…' : '登录中…') : isRegister ? '注册并登录' : '登录'}
          </button>
        </form>

        <p className="auth-hint">数据保存在服务端 SQLite，换台设备登录也能看到你的任务。</p>
      </div>

      <footer className="auth-footer">React · TypeScript · Express · SQLite</footer>
    </div>
  );
}
