import api from './api'
export const applyLeave = (d) => api.post('/leaves', d)
export const getLeaves = (params) => api.get('/leaves', { params })
export const getMyLeaves = (employeeId) => api.get(`/leaves/employee/${employeeId}`)
export const approveLeave = (id) => api.put(`/leaves/${id}/approve`)
export const rejectLeave = (id) => api.put(`/leaves/${id}/reject`)
