import { useAuthStore } from '../store/useAuthStore';

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="topbar">
      <div className="brand brand-sm">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="24" height="24">
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
        <strong>TaskFlow</strong>
      </div>

      <div className="topbar-right">
        <span className="user-chip" title="当前登录用户">
          {user?.username}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void logout()}>
          退出登录
        </button>
      </div>
    </header>
  );
}
