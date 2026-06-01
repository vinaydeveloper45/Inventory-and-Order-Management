import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import { useAppContext } from '../context/AppContext'
import { createProduct, deleteProduct, listProducts, updateProduct } from '../services/productService'
import { formatCurrency, formatDateTime, stockTone } from '../utils/format'

function ProductForm({ product, onSubmit, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      price: product?.price || '',
      quantity_in_stock: product?.quantity_in_stock ?? 0,
    },
  })

  useEffect(() => {
    reset({
      name: product?.name || '',
      sku: product?.sku || '',
      price: product?.price || '',
      quantity_in_stock: product?.quantity_in_stock ?? 0,
    })
  }, [product, reset])

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Name</label>
        <input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 focus:border-accent-400" {...register('name', { required: 'Name is required' })} />
        {errors.name ? <p className="mt-2 text-sm text-red-300">{errors.name.message}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">SKU</label>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-accent-400" {...register('sku', { required: 'SKU is required' })} />
          {errors.sku ? <p className="mt-2 text-sm text-red-300">{errors.sku.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300">Price</label>
          <input type="number" step="0.01" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-accent-400" {...register('price', { required: 'Price is required', min: { value: 0.01, message: 'Price must be greater than 0' } })} />
          {errors.price ? <p className="mt-2 text-sm text-red-300">{errors.price.message}</p> : null}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Quantity in stock</label>
        <input type="number" min="0" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-accent-400" {...register('quantity_in_stock', { required: 'Quantity is required', min: { value: 0, message: 'Quantity cannot be negative' }, valueAsNumber: true })} />
        {errors.quantity_in_stock ? <p className="mt-2 text-sm text-red-300">{errors.quantity_in_stock.message}</p> : null}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10">
          Cancel
        </button>
        <button disabled={isSubmitting} className="rounded-2xl bg-accent-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60">
          {product ? 'Update product' : 'Create product'}
        </button>
      </div>
    </form>
  )
}

export default function ProductsPage() {
  const { runRequest } = useAppContext()
  const [products, setProducts] = useState({ items: [], meta: { page: 1, page_size: 10, total: 0 } })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const loadProducts = async () => {
    const data = await runRequest(() => listProducts({ page, page_size: 10, search: search || undefined, sort_by: sortBy, sort_order: sortOrder }))
    setProducts(data)
  }

  useEffect(() => {
    loadProducts()
  }, [page, search, sortBy, sortOrder])

  const handleSave = async (values) => {
    if (editingProduct) {
      await runRequest(() => updateProduct(editingProduct.id, values), 'Product updated successfully')
    } else {
      await runRequest(() => createProduct(values), 'Product created successfully')
    }
    setModalOpen(false)
    setEditingProduct(null)
    await loadProducts()
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return
    await runRequest(() => deleteProduct(productId), 'Product deleted successfully')
    await loadProducts()
  }

  const openCreate = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Add and update products, search quickly, and keep stock information up to date."
        actions={[
          <button key="add" type="button" onClick={openCreate} className="rounded-2xl bg-accent-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-accent-400">
            Add Product
          </button>,
        ]}
      />
      <div className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-soft xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-3">
          <input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} placeholder="Search products..." className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-accent-400" />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-accent-400">
            <option value="created_at">Sort by newest</option>
            <option value="name">Name</option>
            <option value="sku">SKU</option>
            <option value="price">Price</option>
            <option value="quantity_in_stock">Stock</option>
          </select>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-accent-400">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      {!products.items.length ? (
        <Spinner label="Loading products" />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3">Updated</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                {products.items.map((product) => (
                  <tr key={product.id} className="bg-slate-950/30">
                    <td className="px-3 py-3 font-semibold text-white">{product.name}</td>
                    <td className="px-3 py-3">{product.sku}</td>
                    <td className="px-3 py-3">{formatCurrency(product.price)}</td>
                    <td className="px-3 py-3"><Badge tone={stockTone(product.quantity_in_stock)}>{product.quantity_in_stock}</Badge></td>
                    <td className="px-3 py-3">{formatDateTime(product.updated_at)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openEdit(product)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(product.id)} className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/20">
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
      <Pagination page={products.meta.page} pageSize={products.meta.page_size} total={products.meta.total} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit product' : 'Add product'}>
        <ProductForm product={editingProduct} onSubmit={handleSave} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
