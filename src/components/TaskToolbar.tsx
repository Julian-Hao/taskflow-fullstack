import { useEffect, useState } from 'react';
import { PRIORITY_LABEL } from '../lib/format';
import { useTaskStore } from '../store/useTaskStore';
import { CATEGORIES, PRIORITIES, type StatusFilter } from '../types';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '待完成' },
  { value: 'done', label: '已完成' },
];

const SEARCH_DEBOUNCE_MS = 160;

export function TaskToolbar() {
  const filter = useTaskStore((state) => state.filter);
  const setFilter = useTaskStore((state) => state.setFilter);
  const [query, setQuery] = useState(filter.query);

  // 搜索防抖，避免每次按键都触发重渲染
  useEffect(() => {
    const timer = setTimeout(() => setFilter({ query }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, setFilter]);

  return (
    <section className="toolbar" aria-label="筛选与搜索">
      <div className="segmented" role="tablist">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={filter.status === option.value}
            className={`seg${filter.status === option.value ? ' active' : ''}`}
            onClick={() => setFilter({ status: option.value })}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="toolbar-right">
        <select
          className="input input-sm"
          value={filter.category}
          onChange={(event) => setFilter({ category: event.target.value })}
          aria-label="按分类筛选"
        >
          <option value="all">全部分类</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="input input-sm"
          value={filter.priority}
          onChange={(event) => setFilter({ priority: event.target.value as typeof filter.priority })}
          aria-label="按优先级筛选"
        >
          <option value="all">全部优先级</option>
          {PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {PRIORITY_LABEL[item]}
            </option>
          ))}
        </select>

        <input
          className="input input-sm"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索任务…"
          aria-label="搜索任务"
        />
      </div>
    </section>
  );
}
