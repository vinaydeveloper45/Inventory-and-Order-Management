import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

vi.mock('../services/dashboardService', () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_products: [],
  }),
}))

vi.mock('../services/productService', () => ({
  listProducts: vi.fn().mockResolvedValue({ items: [], meta: { page: 1, page_size: 10, total: 0 } }),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))

vi.mock('../services/customerService', () => ({
  listCustomers: vi.fn().mockResolvedValue({ items: [], meta: { page: 1, page_size: 10, total: 0 } }),
  createCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}))

vi.mock('../services/orderService', () => ({
  listOrders: vi.fn().mockResolvedValue({ items: [], meta: { page: 1, page_size: 10, total: 0 } }),
  createOrder: vi.fn(),
  deleteOrder: vi.fn(),
  getOrder: vi.fn(),
}))

describe('App shell', () => {
  it('renders the main navigation', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Customers' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument()
    })
  })
})
