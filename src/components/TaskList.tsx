import { useMemo, useState } from 'react';
import { filterTasks } from '../lib/format';
import { useTaskStore } from '../store/useTaskStore';
import type { UpdateTaskPayload } from '../types';
import { TaskItem } from './TaskItem';

export function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const filter = useTaskStore((state) => state.filter);
  const toggle = useTaskStore((state) => state.toggle);
  const remove = useTaskStore((state) => state.remove);
  const edit = useTaskStore((state) => state.edit);

  const [editingId, setEditingId] = useState<string | null>(null);

  const visible = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);

  function handleDelete(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    if (window.confirm(`确定删除「${task.title}」吗？此操作不可撤销。`)) {
      void remove(id);
    }
  }

  function handleSave(id: string, patch: UpdateTaskPayload) {
    void edit(id, patch).then((ok) => {
      if (ok) setEditingId(null);
    });
  }

  if (visible.length === 0) {
    const hasAny = tasks.length > 0;
    return (
      <section className="card list-card">
        <div className="empty-state">
          <p className="empty-title">{hasAny ? '没有符合条件的任务' : '这里还很空'}</p>
          <p className="empty-sub">
            {hasAny ? '换个筛选条件或清空搜索试试' : '在上面输入框写下第一件要做的事吧'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card list-card">
      <ul className="task-list">
        {visible.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            editing={editingId === task.id}
            onToggle={(id) => void toggle(id)}
            onDelete={handleDelete}
            onStartEdit={setEditingId}
            onCancelEdit={() => setEditingId(null)}
            onSave={handleSave}
          />
        ))}
      </ul>
    </section>
  );
}
