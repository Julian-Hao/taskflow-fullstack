import { useState, type FormEvent } from 'react';
import { PRIORITY_LABEL } from '../lib/format';
import { useTaskStore } from '../store/useTaskStore';
import { CATEGORIES, PRIORITIES } from '../types';

export function TaskComposer() {
  const add = useTaskStore((state) => state.add);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[3]);
  const [priority, setPriority] = useState<string>('medium');
  const [dueDate, setDueDate] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const ok = await add({
      title: trimmed,
      category,
      priority: priority as (typeof PRIORITIES)[number],
      dueDate,
    });

    if (ok) {
      setTitle('');
      setDueDate('');
    }
  }

  return (
    <section className="card composer" aria-label="新建任务">
      <form className="composer-form" onSubmit={handleSubmit}>
        <input
          className="composer-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="准备做点什么？输入后回车即可添加"
          maxLength={120}
          aria-label="任务标题"
          required
        />

        <div className="composer-row">
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
            onChange={(event) => setPriority(event.target.value)}
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

          <button className="btn btn-primary" type="submit">
            添加任务
          </button>
        </div>
      </form>
    </section>
  );
}
