import React, { useEffect } from 'react';
import { ToastMessage, ToastType } from '../types';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const bgColors = {
    [ToastType.SUCCESS]: 'bg-green-900/90 border-green-500',
    [ToastType.ERROR]: 'bg-red-900/90 border-red-500',
    [ToastType.INFO]: 'bg-blue-900/90 border-blue-500',
  };

  const icons = {
    [ToastType.SUCCESS]: <CheckCircle className="w-5 h-5 text-green-400" />,
    [ToastType.ERROR]: <AlertCircle className="w-5 h-5 text-red-400" />,
    [ToastType.INFO]: <Info className="w-5 h-5 text-blue-400" />,
  };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md min-w-[300px]
      animate-slide-up transition-all duration-300
      ${bgColors[toast.type]}
    `}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      <button onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;