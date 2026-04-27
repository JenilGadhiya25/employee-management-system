import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const titleMap = {
  '/admin/dashboard': 'Dashboard',
  '/admin/employees': 'Employee Management',
  '/admin/attendance': 'Attendance Monitoring',
  '/admin/tasks': 'Task Management',
  '/admin/leaves': 'Leave Approvals',
  '/admin/reports': 'Daily Reports',
  '/admin/analytics': 'Productivity Analytics',
  '/admin/notifications': 'Notifications',
  '/admin/profile': 'Profile Settings',
  '/manager/dashboard': 'Team Dashboard',
  '/manager/attendance': 'Team Attendance',
  '/manager/tasks': 'Team Tasks',
  '/manager/notifications': 'Notifications',
  '/manager/profile': 'Profile Settings',
  '/employee/dashboard': 'Dashboard',
  '/employee/attendance': 'My Attendance',
  '/employee/tasks': 'My Tasks',
  '/employee/report': 'Daily Report',
  '/employee/leave': 'Apply Leave',
  '/employee/productivity': 'My Productivity',
  '/employee/notifications': 'Notifications',
  '/employee/profile': 'My Profile',
}

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const title = titleMap[pathname] || 'Dashboard'

  return (
    <div className="app-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      <div className={`main-content${collapsed ? ' collapsed' : ''}`}>
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          collapsed={collapsed}
        />
        <main className="page-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
