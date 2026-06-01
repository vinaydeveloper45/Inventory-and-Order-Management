import http from './http'

export const getDashboardStats = () => http.get('/dashboard/stats').then((response) => response.data)
