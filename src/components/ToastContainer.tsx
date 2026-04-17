import type { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const toastIcons = {
  info: 'ℹ️',
  alert: '🚨',
  success: '✅'
};

const toastClasses = {
  info: 'ews-toast info',
  alert: 'ews-toast alert',
  success: 'ews-toast success'
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-md px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={toastClasses[toast.type]}
          onClick={() => onRemove(toast.id)}
        >
          <span className="text-lg flex-shrink-0">{toastIcons[toast.type]}</span>
          <span className="flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
