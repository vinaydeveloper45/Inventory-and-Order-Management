import { createContext, useContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [pendingRequests, setPendingRequests] = useState(0)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])

  const loading = pendingRequests > 0

  const notify = (type, title, message) => {
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((current) => [...current, { id, type, title, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3500)
  }

  const runRequest = async (request, successMessage) => {
    setPendingRequests((current) => current + 1)
    setError('')
    try {
      const result = await request()
      if (successMessage) {
        notify('success', 'Success', successMessage)
      }
      return result
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Something went wrong'
      setError(message)
      notify('error', 'Request failed', message)
      throw err
    } finally {
      setPendingRequests((current) => Math.max(0, current - 1))
    }
  }

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  const value = useMemo(
    () => ({
      loading,
      error,
      toasts,
      notify,
      dismissToast,
      runRequest,
      setError,
    }),
    [loading, error, toasts],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}
