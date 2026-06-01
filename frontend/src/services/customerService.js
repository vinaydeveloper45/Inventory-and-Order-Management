import http from './http'

export const listCustomers = (params) => http.get('/customers', { params }).then((response) => response.data)
export const getCustomer = (id) => http.get(`/customers/${id}`).then((response) => response.data)
export const createCustomer = (payload) => http.post('/customers', payload).then((response) => response.data)
export const deleteCustomer = (id) => http.delete(`/customers/${id}`).then((response) => response.data)
