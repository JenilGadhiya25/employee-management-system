import api from './api'

export const clockIn         = (note) => api.post('/attendance/punchin',  { note })
export const lunchBreak      = (note) => api.put('/attendance/lunch',     { note })
export const clockOut        = (note) => api.put('/attendance/punchout',  { note })
export const endDay          = (note) => api.put('/attendance/endday',    { note })
export const getTodayRecord  = ()     => api.get('/attendance/today')
export const getActiveNow    = ()     => api.get('/attendance/active-now')
export const getAllAttendance = (p)   => api.get('/attendance', { params: p })
export const getAttendanceByEmployee = (id, p) => api.get(`/attendance/${id}`, { params: p })

// legacy aliases
export const punchIn  = clockIn
export const punchOut = clockOut
