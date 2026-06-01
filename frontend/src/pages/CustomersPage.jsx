import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import { useAppContext } from '../context/AppContext'
import { createCustomer, deleteCustomer, listCustomers } from '../services/customerService'
import Badge from '../components/Badge'

function CustomerForm({ customer, onSubmit, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      full_name: customer?.full_name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    },
  })

  useEffect(() => {
    reset({
      full_name: customer?.full_name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    })
  }, [customer, reset])

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Full name</label>
        <input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-accent-400" {...register('full_name', { required: 'Full name is required' })} />
        {errors.full_name ? <p className="mt-2 text-sm text-red-300">{errors.full_name.message}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input type="email" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-accent-400" {...register('email', { required: 'Email is required' })} />
          {errors.email ? <p className="mt-2 text-sm text-red-300">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Phone</label>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-accent-400" {...register('phone', { required: 'Phone is required' })} />
          {errors.phone ? <p className="mt-2 text-sm text-red-300">{errors.phone.message}</p> : null}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10">
          Cancel
        </button>
        <button disabled={isSubmitting} className="rounded-2xl bg-accent-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60">
          Save customer
        </button>
      </div>
    </form>
  )
}

export default function CustomersPage() {
  const { runRequest } = useAppContext()
  const [customers, setCustomers] = useState({ items: [], meta: { page: 1, page_size: 10, total: 0 } })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)

  const loadCustomers = async () => {
    const data = await runRequest(() => listCustomers({ page, page_size: 10, search: search || undefined }))
    setCustomers(data)
  }

  useEffect(() => {
    loadCustomers()
  }, [page, search])

  const handleSave = async (values) => {
    await runRequest(() => createCustomer(values), 'Customer created successfully')
    setModalOpen(false)
    setEditingCustomer(null)
    await loadCustomers()
  }

  const handleDelete = async (customerId) => {
    if (!window.confirm('Delete this customer?')) return
    await runRequest(() => deleteCustomer(customerId), 'Customer deleted successfully')
    await loadCustomers()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="Customers"
        description="Keep customer contact details organized for orders and support."
        actions={[
          <button key="add" type="button" onClick={() => setModalOpen(true)} className="rounded-2xl bg-accent-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-accent-400">
            Add Customer
          </button>,
        ]}
      />
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-soft">
        <input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} placeholder="Search customers..." className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-accent-400" />
      </div>
      {!customers.items.length ? (
        <Spinner label="Loading customers" />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                {customers.items.map((customer) => (
                  <tr key={customer.id} className="bg-slate-950/30">
                    <td className="px-5 py-4 font-semibold text-white">{customer.full_name}</td>
                    <td className="px-5 py-4">{customer.email}</td>
                    <td className="px-5 py-4">{customer.phone}</td>
                    <td className="px-5 py-4"><Badge tone="info">Active</Badge></td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => handleDelete(customer.id)} className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/20">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={customers.meta.page} pageSize={customers.meta.page_size} total={customers.meta.total} onPageChange={setPage} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingCustomer ? 'Edit customer' : 'Add customer'}>
        <CustomerForm customer={editingCustomer} onSubmit={handleSave} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
