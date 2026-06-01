import { useAppContext } from '../context/AppContext'

const styles = {
  success: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-50',
  error: 'border-red-400/30 bg-red-500/15 text-red-50',
  info: 'border-sky-400/30 bg-sky-500/15 text-sky-50',
}

export default function ToastStack() {
  const { toasts, dismissToast } = useAppContext()

  return (
    <div className="fixed right-4 top-4 z-50 space-y-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <div key={toast.id} className={`w-[min(92vw,20rem)] rounded-2xl border px-4 py-3 shadow-soft backdrop-blur ${styles[toast.type]}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{toast.title}</p>
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            </div>
            <button type="button" className="text-lg leading-none opacity-80 hover:opacity-100" onClick={() => dismissToast(toast.id)}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
