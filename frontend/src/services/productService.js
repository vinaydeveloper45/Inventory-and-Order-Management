import http from './http'

export const listProducts = (params) => http.get('/products', { params }).then((response) => response.data)
export const getProduct = (id) => http.get(`/products/${id}`).then((response) => response.data)
export const createProduct = (payload) => http.post('/products', payload).then((response) => response.data)
export const updateProduct = (id, payload) => http.put(`/products/${id}`, payload).then((response) => response.data)
export const deleteProduct = (id) => http.delete(`/products/${id}`).then((response) => response.data)
