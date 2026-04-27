import api from './api'
export const getEmployees = (params) => api.get('/employees', { params })
export const getEmployee = (id) => api.get(`/employees/${id}`)
export const createEmployee = (d) => api.post('/employees', d)
export const updateEmployee = (id, d) => api.put(`/employees/${id}`, d)
export const deleteEmployee = (id) => api.delete(`/employees/${id}`)
