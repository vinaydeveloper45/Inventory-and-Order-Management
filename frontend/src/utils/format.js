export const formatCurrency = (value) => {
  const amount = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}

export const formatDateTime = (value) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export const stockTone = (quantity, lowStockThreshold = 5) => {
  if (quantity <= 0) return 'danger'
  if (quantity <= lowStockThreshold) return 'warning'
  return 'success'
}
