import api from './api'
export const submitDailyReport = (d) => api.post('/reports/daily', d)
export const getAllReports = (params) => api.get('/reports', { params })
export const getReportsByEmployee = (id, params) => api.get(`/reports/${id}`, { params })
