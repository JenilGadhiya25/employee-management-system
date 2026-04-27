import api from './api'
export const getTasks = (params) => api.get('/tasks', { params })
export const getTasksByEmployee = (id) => api.get(`/tasks/employee/${id}`)
export const createTask = (d) => api.post('/tasks', d)
export const updateTask = (id, d) => api.put(`/tasks/${id}`, d)
export const updateTaskStatus = (id, status) => api.put(`/tasks/${id}/status`, { status })
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
