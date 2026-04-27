import api from './api'

const dashboardService = {
  getDashboardStats: () => api.get('/dashboard/stats'),
  getProductivity: (month, year) => api.get('/dashboard/productivity', { params: { month, year } }),
  getMonthlyAttendance: (month, year) => api.get('/dashboard/monthly-attendance', { params: { month, year } }),
  getTaskSummary: () => api.get('/dashboard/task-summary'),
  getCalendarData: (month, year) => api.get('/dashboard/calendar', { params: { month, year } }),
};

export default dashboardService;
