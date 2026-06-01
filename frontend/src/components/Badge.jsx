export default function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/10 bg-white/5 text-slate-200',
    success: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
    warning: 'border-warning-300/30 bg-warning-500/15 text-warning-50',
    danger: 'border-red-400/30 bg-red-500/15 text-red-100',
    info: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
  }

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tones[tone]}`}>{children}</span>
}
