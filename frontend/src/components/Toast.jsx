import React, { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 5000),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    icon: 'text-emerald-400',
    bar: 'bg-emerald-400',
  },
  error: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    icon: 'text-rose-400',
    bar: 'bg-rose-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    icon: 'text-amber-400',
    bar: 'bg-amber-400',
  },
  info: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/25',
    icon: 'text-indigo-400',
    bar: 'bg-indigo-400',
  },
};

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        const styles = styleMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'} 
              backdrop-blur-2xl ${styles.bg} ${styles.border} border rounded-2xl p-4 shadow-2xl
              flex items-start gap-3 relative overflow-hidden group`}
          >
            {/* Animated accent bar */}
            <div className={`absolute bottom-0 left-0 h-0.5 ${styles.bar} opacity-50`}
              style={{
                animation: `shrinkBar ${toast.type === 'error' ? '5s' : '4s'} linear forwards`,
                width: '100%',
              }}
            />
            
            <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm text-white font-medium flex-1 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes shrinkBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
