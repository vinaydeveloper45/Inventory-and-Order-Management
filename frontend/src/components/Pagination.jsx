export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
      <span>
        Page {page} of {totalPages} · {total} records
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">
          Prev
        </button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  )
}
