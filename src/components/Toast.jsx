export function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      className="fixed bottom-6 right-6 z-50 animate-toast-in px-5 py-3 rounded-xl text-sm shadow-lg"
      style={{
        background: isError ? '#fee2e2' : '#f0fdf4',
        color: isError ? '#991b1b' : '#166534',
        border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
      }}
    >
      {toast.msg}
    </div>
  );
}
