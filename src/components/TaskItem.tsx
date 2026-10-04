import { useState, type KeyboardEvent } from 'react';
import { PRIORITY_LABEL, describeDue } from '../lib/format';
import { CATEGORIES, PRIORITIES, type Task, type UpdateTaskPayload } from '../types';

interface TaskItemProps {
  task: Task;
  editing: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSave: (id: string, patch: UpdateTaskPayload) => void;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true">
      <path
        d="M4 10.5l4 4 8-8.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 编辑态表单。仅在进入编辑时挂载，因此可直接用 task 作为初始值。 */
function TaskEditForm({
  task,
  onCancel,
  onSave,
}: {
  task: Task;
  onCancel: () => void;
  onSave: (id: string, patch: UpdateTaskPayload) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [category, setCategory] = useState(task.category);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(task.id, { title: trimmed, notes: notes.trim(), category, priority, dueDate });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <div className="task-edit" onKeyDown={handleKeyDown}>
      <input
        className="input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="任务标题"
        maxLength={120}
        aria-label="任务标题"
      />
      <input
        className="input"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="备注（可选）"
        maxLength={500}
        aria-label="备注"
      />
      <div className="task-edit-row">
        <select
          className="input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="分类"
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={priority}
          onChange={(event) => setPriority(event.target.value as Task['priority'])}
          aria-label="优先级"
        >
          {PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {PRIORITY_LABEL[item]}优先级
            </option>
          ))}
        </select>

        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="截止日期"
        />

        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
          保存
        </button>
      </div>
    </div>
  );
}

export function TaskItem({
  task,
  editing,
  onToggle,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSave,
}: TaskItemProps) {
  const due = describeDue(task.dueDate);

  if (editing) {
    return (
      <li className="task-item" data-id={task.id} data-testid="task-item">
        <TaskEditForm task={task} onCancel={onCancelEdit} onSave={onSave} />
      </li>
    );
  }

  return (
    <li
      className={`task-item${task.done ? ' done' : ''}`}
      data-id={task.id}
      data-testid="task-item"
    >
      <button
        type="button"
        className="check"
        onClick={() => onToggle(task.id)}
        title={task.done ? '标记为未完成' : '标记为完成'}
        aria-label={task.done ? '标记为未完成' : '标记为完成'}
        aria-pressed={task.done}
      >
        <CheckIcon />
      </button>

      <div className="task-body">
        <div className="task-title" data-testid="task-title">
          {task.title}
        </div>
        {task.notes && <p className="task-notes">{task.notes}</p>}
        <div className="task-meta">
          <span className="badge">{task.category}</span>
          <span className={`badge badge-pri-${task.priority}`}>
            {PRIORITY_LABEL[task.priority]}优先
          </span>
          {due && (
            <span className={`badge badge-due${due.overdue && !task.done ? ' overdue' : ''}`}>
              截止 {due.label}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onStartEdit(task.id)}
          title="编辑"
          aria-label="编辑"
        >
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path
              d="M13.6 3.4l3 3L7.3 15.7l-3.6.6.6-3.6 9.3-9.3z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => onDelete(task.id)}
          title="删除"
          aria-label="删除"
        >
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path
              d="M4 6h12M8 6V4h4v2M6.5 6l.7 9.2h5.6L13.5 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}
