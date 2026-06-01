import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ToastStack from '../components/ToastStack'
import { useAppContext } from '../context/AppContext'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { error, setError } = useAppContext()

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setSidebarOpen((value) => !value)} />
          <main className="relative flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5">
              {error ? (
                <div className="flex items-start justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-soft">
                  <span>{error}</span>
                  <button type="button" className="ml-4 text-red-100/80 hover:text-white" onClick={() => setError('')}>
                    Dismiss
                  </button>
                </div>
              ) : null}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <ToastStack />
    </div>
  )
}
