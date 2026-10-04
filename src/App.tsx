import { useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { AuthPanel } from './components/AuthPanel';
import { StatsBar } from './components/StatsBar';
import { TaskComposer } from './components/TaskComposer';
import { TaskList } from './components/TaskList';
import { TaskToolbar } from './components/TaskToolbar';
import { ToastHost } from './components/ToastHost';
import { onSessionExpired } from './store/session';
import { useAuthStore } from './store/useAuthStore';
import { useTaskStore } from './store/useTaskStore';
import { toast } from './store/useToastStore';

export default function App() {
  const user = useAuthStore((state) => state.user);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  const tasks = useTaskStore((state) => state.tasks);
  const loadTasks = useTaskStore((state) => state.load);
  const resetTasks = useTaskStore((state) => state.reset);

  // 首次挂载：用本地 token 尝试恢复会话
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // 登录态变化时同步任务数据
  useEffect(() => {
    if (user) void loadTasks();
    else resetTasks();
  }, [user, loadTasks, resetTasks]);

  // 任何请求返回 401 → 回到登录态
  useEffect(
    () =>
      onSessionExpired(() => {
        useAuthStore.setState({ user: null });
        toast.error('登录已过期，请重新登录');
      }),
    [],
  );

  if (!bootstrapped) {
    return <div className="boot-splash">正在加载…</div>;
  }

  if (!user) {
    return (
      <>
        <AuthPanel />
        <ToastHost />
      </>
    );
  }

  return (
    <>
      <div className="app-view">
        <AppHeader />
        <main className="container">
          <StatsBar tasks={tasks} />
          <TaskComposer />
          <TaskToolbar />
          <TaskList />
        </main>
      </div>
      <ToastHost />
    </>
  );
}
