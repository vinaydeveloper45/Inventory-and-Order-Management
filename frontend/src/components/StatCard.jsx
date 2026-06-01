export default function StatCard({ title, value, hint, accent = 'from-accent-500/30 to-emerald-500/10' }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
      <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  )
}
