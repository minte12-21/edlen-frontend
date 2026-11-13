// Small floating messages (Tailwind only, so no CSS file needed)
export default function ToastHost({ toasts }) {
  return (
    <div className="fixed left-0 right-0 bottom-28 z-[9000] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`max-w-sm w-full rounded-2xl px-4 py-3 text-sm font-bold shadow-xl ${t.type === 'error' ? 'bg-red-600 text-white' : 'bg-white text-[#0f1f14]'}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
