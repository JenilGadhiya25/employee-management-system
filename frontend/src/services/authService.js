import api from './api'
export const getMe = () => api.get('/auth/me')
export const loginUser = (d) => api.post('/auth/login', d)
export const registerUser = (d) => api.post('/auth/register', d)
export const logoutUser = () => api.get('/auth/logout')
