import { Check, AlertCircle } from 'lucide-react';

export function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-toast-in"
      style={{ background: 'rgba(30,20,20,0.92)', backdropFilter: 'blur(20px)', color: '#fff', fontSize: 14, fontWeight: 500, maxWidth: 340 }}>
      <span className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
        style={{ background: isError ? '#ef4444' : '#22c55e' }}>
        {isError ? <AlertCircle size={13} /> : <Check size={13} strokeWidth={3} />}
      </span>
      <span>{toast.msg}</span>
    </div>
  );
}
