export default function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation"
          >
            <span className="text-xl">☰</span>
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-300">Business dashboard</p>
            <h1 className="text-lg font-semibold text-white sm:text-xl">Inventory & Order Management</h1>
          </div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            Team dashboard
          </div>
        </div>
      </div>
    </header>
  )
}
