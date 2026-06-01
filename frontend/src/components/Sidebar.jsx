import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
    isActive
      ? 'bg-accent-500/20 text-accent-100 ring-1 ring-accent-400/30'
      : 'text-slate-300 hover:bg-white/5 hover:text-white',
  ].join(' ')

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-white/10 bg-slate-950/95 px-3 py-4 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:z-20 lg:w-72 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-300">Inventory</p>
            <p className="mt-2 text-xl font-bold text-white">Control Center</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 lg:hidden"
          >
            Close
          </button>
        </div>
        <nav className="space-y-2">
          <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={linkClass} onClick={onClose}>
            <span>Products</span>
          </NavLink>
          <NavLink to="/customers" className={linkClass} onClick={onClose}>
            <span>Customers</span>
          </NavLink>
          <NavLink to="/orders" className={linkClass} onClick={onClose}>
            <span>Orders</span>
          </NavLink>
        </nav>
        <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
          <p className="font-semibold text-white">For everyday operations</p>
          <p className="mt-2 leading-6">Manage products, customers, and orders in one place.</p>
        </div>
      </aside>
    </>
  )
}
