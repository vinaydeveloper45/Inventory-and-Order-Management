import http from './http'

export const listOrders = (params) => http.get('/orders', { params }).then((response) => response.data)
export const getOrder = (id) => http.get(`/orders/${id}`).then((response) => response.data)
export const createOrder = (payload) => http.post('/orders', payload).then((response) => response.data)
export const deleteOrder = (id) => http.delete(`/orders/${id}`).then((response) => response.data)
