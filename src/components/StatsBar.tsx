import { computeStats } from '../lib/format';
import type { Task } from '../types';

interface StatsBarProps {
  tasks: Task[];
}

export function StatsBar({ tasks }: StatsBarProps) {
  const { total, todo, done, completionRate } = computeStats(tasks);

  return (
    <section className="stats" aria-label="任务统计">
      <div className="stat-card">
        <span className="stat-num" data-testid="stat-total">
          {total}
        </span>
        <span className="stat-label">全部任务</span>
      </div>
      <div className="stat-card">
        <span className="stat-num stat-todo" data-testid="stat-todo">
          {todo}
        </span>
        <span className="stat-label">待完成</span>
      </div>
      <div className="stat-card">
        <span className="stat-num stat-done" data-testid="stat-done">
          {done}
        </span>
        <span className="stat-label">已完成</span>
      </div>
      <div className="stat-card">
        <span className="stat-num" data-testid="stat-rate">
          {completionRate}%
        </span>
        <span className="stat-label">完成率</span>
      </div>
    </section>
  );
}
