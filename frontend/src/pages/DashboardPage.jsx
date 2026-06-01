import { useEffect, useState } from 'react'
import { getDashboardStats } from '../services/dashboardService'
import { useAppContext } from '../context/AppContext'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import { formatCurrency, formatDateTime, stockTone } from '../utils/format'

export default function DashboardPage() {
  const { runRequest } = useAppContext()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      const data = await runRequest(() => getDashboardStats())
      setStats(data)
    }
    load()
  }, [runRequest])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Track inventory health, customer volume, and order activity from a single operational view."
      />
      {!stats ? (
        <Spinner />
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Products" value={stats.total_products} hint="Catalog items currently managed" />
            <StatCard title="Total Customers" value={stats.total_customers} hint="Registered customer records" accent="from-sky-400/30 to-cyan-400/10" />
            <StatCard title="Total Orders" value={stats.total_orders} hint="Completed order records" accent="from-warning-400/30 to-amber-400/10" />
            <StatCard title="Low Stock" value={stats.low_stock_products.length} hint="Items below the warning threshold" accent="from-red-400/30 to-rose-400/10" />
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">Low stock products</h3>
                <p className="mt-1 text-sm text-slate-400">Attention items that need replenishment before the next order spike.</p>
              </div>
              <Badge tone="warning">Inventory watch</Badge>
            </div>
            {stats.low_stock_products.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {stats.low_stock_products.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-400">SKU {product.sku}</p>
                      </div>
                      <Badge tone={stockTone(product.quantity_in_stock)}>{product.quantity_in_stock} in stock</Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                      <span>{formatCurrency(product.price)}</span>
                      <span>{formatDateTime(product.updated_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-10 text-center text-slate-400">
                No products are currently below the warning threshold.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
