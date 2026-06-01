import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import { useAppContext } from '../context/AppContext'
import { createOrder, deleteOrder, getOrder, listOrders } from '../services/orderService'
import { listCustomers } from '../services/customerService'
import { listProducts } from '../services/productService'
import { formatCurrency, formatDateTime, stockTone } from '../utils/format'

function OrderFormModal({ open, customers, products, onClose, onSubmit }) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      customer_id: '',
      items: [{ product_id: '', quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    if (open) {
      reset({ customer_id: '', items: [{ product_id: '', quantity: 1 }] })
    }
  }, [open, reset])

  return (
    <Modal open={open} onClose={onClose} title="Create order" widthClass="max-w-4xl">
      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Customer</label>
          <select className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-accent-400" {...register('customer_id', { required: 'Customer is required' })}>
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.full_name} · {customer.email}
              </option>
            ))}
          </select>
          {errors.customer_id ? <p className="mt-2 text-sm text-red-300">{errors.customer_id.message}</p> : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">Order items</h3>
              <p className="mt-1 text-sm text-slate-400">Add at least one product line item with quantity greater than zero.</p>
            </div>
            <button type="button" onClick={() => append({ product_id: '', quantity: 1 })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
              Add item
            </button>
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 md:grid-cols-[minmax(0,1fr)_140px_auto]">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Product</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-accent-400" {...register(`items.${index}.product_id`, { required: 'Product is required' })}>
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} · {product.sku} · stock {product.quantity_in_stock}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Qty</label>
                  <input type="number" min="1" className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-accent-400" {...register(`items.${index}.quantity`, { required: 'Quantity is required', min: { value: 1, message: 'Quantity must be greater than 0' }, valueAsNumber: true })} />
                </div>
                <div className="flex items-end">
                  <button type="button" disabled={fields.length === 1} onClick={() => remove(index)} className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10">
            Cancel
          </button>
          <button disabled={isSubmitting} className="rounded-2xl bg-accent-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60">
            Place order
          </button>
        </div>
      </form>
    </Modal>
  )
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null

  return (
    <Modal open={Boolean(order)} onClose={onClose} title={`Order ${order.id}`} widthClass="max-w-4xl">
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Customer</p>
            <p className="mt-2 text-lg font-semibold text-white">{order.customer.full_name}</p>
            <p className="mt-1 text-sm text-slate-400">{order.customer.email} · {order.customer.phone}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Summary</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="info">{order.status}</Badge>
              <Badge tone="success">{formatCurrency(order.total_amount)}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-400">Placed on {formatDateTime(order.created_at)}</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-950/70 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Unit price</th>
                <th className="px-4 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-sm text-slate-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.product_name}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-3">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

export default function OrdersPage() {
  const { runRequest } = useAppContext()
  const [orders, setOrders] = useState({ items: [], meta: { page: 1, page_size: 10, total: 0 } })
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const loadPageData = async () => {
    const [ordersData, customersData, productsData] = await Promise.all([
      runRequest(() => listOrders({ page, page_size: 10 })),
      runRequest(() => listCustomers({ page: 1, page_size: 100 })),
      runRequest(() => listProducts({ page: 1, page_size: 100, sort_by: 'name', sort_order: 'asc' })),
    ])
    setOrders(ordersData)
    setCustomers(customersData.items)
    setProducts(productsData.items)
  }

  useEffect(() => {
    loadPageData()
  }, [page])

  const handleCreateOrder = async (values) => {
    await runRequest(() => createOrder(values), 'Order created successfully')
    setCreateOpen(false)
    await loadPageData()
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order and restore stock?')) return
    await runRequest(() => deleteOrder(orderId), 'Order deleted successfully')
    await loadPageData()
  }

  const openOrderDetails = async (orderId) => {
    const order = await runRequest(() => getOrder(orderId))
    setSelectedOrder(order)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Orders"
        title="Orders"
        description="Create and manage orders; stock is adjusted automatically when orders are placed."
        actions={[
          <button key="create" type="button" onClick={() => setCreateOpen(true)} className="rounded-2xl bg-accent-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-accent-400">
            Create Order
          </button>,
        ]}
      />
      {!orders.items.length ? (
        <Spinner label="Loading orders" />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                {orders.items.map((order) => (
                  <tr key={order.id} className="bg-slate-950/30">
                    <td className="px-5 py-4 font-semibold text-white">{order.id.slice(0, 8)}</td>
                    <td className="px-5 py-4">{order.customer.full_name}</td>
                    <td className="px-5 py-4">{formatCurrency(order.total_amount)}</td>
                    <td className="px-5 py-4"><Badge tone="success">{order.status}</Badge></td>
                    <td className="px-5 py-4">{formatDateTime(order.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openOrderDetails(order.id)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10">
                          Details
                        </button>
                        <button type="button" onClick={() => handleDeleteOrder(order.id)} className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/20">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={orders.meta.page} pageSize={orders.meta.page_size} total={orders.meta.total} onPageChange={setPage} />

      <OrderFormModal open={createOpen} customers={customers} products={products} onClose={() => setCreateOpen(false)} onSubmit={handleCreateOrder} />
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}
