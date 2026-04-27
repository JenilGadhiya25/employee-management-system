import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/admin/Dashboard'
import Employees from './pages/admin/Employees'
import AttendanceAdmin from './pages/admin/Attendance'
import Tasks from './pages/admin/Tasks'
import Leaves from './pages/admin/Leaves'
import Reports from './pages/admin/Reports'
import Analytics from './pages/admin/Analytics'
import NotificationsAdmin from './pages/admin/Notifications'
import ProfileAdmin from './pages/admin/Profile'

import EmployeeDashboard from './pages/employee/Dashboard'
import AttendanceEmployee from './pages/employee/Attendance'
import MyTasks from './pages/employee/MyTasks'
import DailyReport from './pages/employee/DailyReport'
import ApplyLeave from './pages/employee/ApplyLeave'
import MyProductivity from './pages/employee/MyProductivity'
import NotificationsEmployee from './pages/employee/Notifications'
import ProfileEmployee from './pages/employee/Profile'

import ManagerDashboard from './pages/manager/Dashboard'
import ManagerAttendance from './pages/manager/Attendance'
import ManagerTasks from './pages/manager/Tasks'
import ManagerNotifications from './pages/manager/Notifications'
import ManagerProfile from './pages/manager/Profile'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop theme="light" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<AttendanceAdmin />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<NotificationsAdmin />} />
          <Route path="profile" element={<ProfileAdmin />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={
          <ProtectedRoute roles={['manager']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="attendance" element={<ManagerAttendance />} />
          <Route path="tasks" element={<ManagerTasks />} />
          <Route path="notifications" element={<ManagerNotifications />} />
          <Route path="profile" element={<ManagerProfile />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={
          <ProtectedRoute roles={['employee']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="attendance" element={<AttendanceEmployee />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="report" element={<DailyReport />} />
          <Route path="leave" element={<ApplyLeave />} />
          <Route path="productivity" element={<MyProductivity />} />
          <Route path="notifications" element={<NotificationsEmployee />} />
          <Route path="profile" element={<ProfileEmployee />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App
