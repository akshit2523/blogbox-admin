export default function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="a-toast bg-slate-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{t.msg}</div>
      ))}
    </div>
  );
}
