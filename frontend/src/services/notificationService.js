import api from './api'
export const getNotifications = (userId) => api.get(`/notifications/${userId}`)
export const createNotification = (d) => api.post('/notifications', d)
