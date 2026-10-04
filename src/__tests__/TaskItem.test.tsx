import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types';

const task: Task = {
  id: 'task-1',
  userId: 'user-1',
  title: '写周报',
  notes: '汇总本周进展',
  category: '工作',
  priority: 'high',
  dueDate: '',
  done: false,
  createdAt: 1,
  updatedAt: 1,
};

function setup(overrides: Partial<Task> = {}, editing = false) {
  const handlers = {
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onSave: vi.fn(),
  };

  render(<TaskItem task={{ ...task, ...overrides }} editing={editing} {...handlers} />);

  return handlers;
}

describe('TaskItem', () => {
  it('渲染标题、备注与分类/优先级标签', () => {
    setup();

    expect(screen.getByTestId('task-title')).toHaveTextContent('写周报');
    expect(screen.getByText('汇总本周进展')).toBeInTheDocument();
    expect(screen.getByText('工作')).toBeInTheDocument();
    expect(screen.getByText('高优先')).toBeInTheDocument();
  });

  it('未完成时不带 done 类名', () => {
    setup({ done: false });

    expect(screen.getByTestId('task-item')).not.toHaveClass('done');
  });

  it('已完成时带 done 类名', () => {
    setup({ done: true });

    expect(screen.getByTestId('task-item')).toHaveClass('done');
  });

  it('点击勾选按钮触发 onToggle 并传入任务 id', () => {
    const handlers = setup();

    fireEvent.click(screen.getByLabelText('标记为完成'));

    expect(handlers.onToggle).toHaveBeenCalledWith('task-1');
  });

  it('已完成时按钮语义变为「标记为未完成」', () => {
    setup({ done: true });

    expect(screen.getByLabelText('标记为未完成')).toBeInTheDocument();
  });

  it('点击删除按钮触发 onDelete', () => {
    const handlers = setup();

    fireEvent.click(screen.getByLabelText('删除'));

    expect(handlers.onDelete).toHaveBeenCalledWith('task-1');
  });

  it('点击编辑按钮触发 onStartEdit', () => {
    const handlers = setup();

    fireEvent.click(screen.getByLabelText('编辑'));

    expect(handlers.onStartEdit).toHaveBeenCalledWith('task-1');
  });

  it('逾期任务显示「截止」标记', () => {
    setup({ dueDate: '2020-01-01' });

    expect(screen.getByText(/截止/)).toBeInTheDocument();
  });

  it('编辑态渲染输入框并回填原值，保存时提交改动', () => {
    const handlers = setup({}, true);

    const titleInput = screen.getByLabelText('任务标题') as HTMLInputElement;
    expect(titleInput.value).toBe('写周报');

    fireEvent.change(titleInput, { target: { value: '写周报（终稿）' } });
    fireEvent.click(screen.getByText('保存'));

    expect(handlers.onSave).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({ title: '写周报（终稿）' }),
    );
  });

  it('编辑态标题清空后不提交', () => {
    const handlers = setup({}, true);

    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '   ' } });
    fireEvent.click(screen.getByText('保存'));

    expect(handlers.onSave).not.toHaveBeenCalled();
  });

  it('编辑态点击取消触发 onCancelEdit', () => {
    const handlers = setup({}, true);

    fireEvent.click(screen.getByText('取消'));

    expect(handlers.onCancelEdit).toHaveBeenCalled();
  });
});
