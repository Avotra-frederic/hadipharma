import { useEffect, useState } from 'react';
import { LiaCheckCircleSolid, LiaExclamationCircleSolid, LiaExclamationTriangleSolid, LiaInfoCircleSolid, LiaTimesSolid } from 'react-icons/lia';
import type { ToastMessage } from '../features/ui/toast/ToastContext';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICON_MAP = {
  success: <LiaCheckCircleSolid size={20} className="text-emerald-600" />,
  error: <LiaExclamationCircleSolid size={20} className="text-rose-600" />,
  info: <LiaInfoCircleSolid size={20} className="text-sky-600" />,
  warning: <LiaExclamationTriangleSolid size={20} className="text-amber-600" />,
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsVisible(true), 10);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 rounded-3xl border p-4 shadow-2xl transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : ''}
        ${toast.type === 'error' ? 'bg-rose-50 border-rose-200' : ''}
        ${toast.type === 'info' ? 'bg-sky-50 border-sky-200' : ''}
        ${toast.type === 'warning' ? 'bg-amber-50 border-amber-200' : ''}`}
    >
      <div className="mt-0.5">{ICON_MAP[toast.type]}</div>
      <div className="min-w-0 flex-1">
        {toast.title && <p className="text-sm font-semibold text-slate-900 mb-1">{toast.title}</p>}
        <p className="text-sm text-slate-700">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-slate-900 focus:outline-none"
      >
        <LiaTimesSolid size={18} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3 p-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
