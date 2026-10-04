import { useToastStore } from '../store/useToastStore';

export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className={`toast${item.type === 'error' ? ' error' : ''}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
