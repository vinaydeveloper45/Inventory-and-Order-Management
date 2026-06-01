export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center py-10 text-slate-300">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-accent-400" />
        <span>{label}</span>
      </div>
    </div>
  )
}
