import { useState, useCallback, useEffect, useRef } from 'react';
import './Toast.css';

/* ── Single toast item ── */
function ToastItem({ toast, onRemove }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), toast.duration - 350);
    const t2 = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast, onRemove]);

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  const titles = { success: 'انجام شد', error: 'خطا', warning: 'هشدار', info: 'توجه' };

  return (
    <div
      className={`toast-item toast-${toast.type} ${leaving ? 'toast-leave' : 'toast-enter'}`}
      style={{ '--toast-dur': `${toast.duration}ms` }}
    >
      <span className="toast-icon">{icons[toast.type]}</span>
      <div className="toast-body">
        <span className="toast-title">{titles[toast.type]}</span>
        <span className="toast-msg">{toast.message}</span>
      </div>
      <button className="toast-close" onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 350); }}>✕</button>
      <span className="toast-progress" />
    </div>
  );
}

/* ── Container ── */
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

/* ── Hook ── */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((message, type = 'info', duration = 3200) => {
    const id = ++idRef.current;
    setToasts(p => [...p, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback(id => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const success = useCallback((msg) => toast(msg, 'success'), [toast]);
  const error   = useCallback((msg) => toast(msg, 'error',   4000), [toast]);
  const warning = useCallback((msg) => toast(msg, 'warning', 3500), [toast]);
  const info    = useCallback((msg) => toast(msg, 'info'),    [toast]);

  return { toasts, removeToast, toast, success, error, warning, info };
}
