import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiGrid, FiUsers, FiClock, FiCheckSquare, FiCalendar,
  FiFileText, FiBell, FiBarChart2, FiUser, FiLogOut,
  FiActivity, FiTrendingUp, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi'

const adminGroups = [
  {
    title: 'General',
    links: [
      { to: '/admin/dashboard',     icon: FiGrid,        label: 'Dashboard' },
      { to: '/admin/employees',     icon: FiUsers,       label: 'Employees' },
      { to: '/admin/attendance',    icon: FiClock,       label: 'Attendance' },
      { to: '/admin/leaves',        icon: FiCalendar,    label: 'Leave Approvals' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { to: '/admin/tasks',         icon: FiCheckSquare, label: 'Tasks' },
      { to: '/admin/reports',       icon: FiFileText,    label: 'Reports' },
      { to: '/admin/analytics',     icon: FiBarChart2,   label: 'Analytics' },
      { to: '/admin/notifications', icon: FiBell,        label: 'Notifications' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/admin/profile',       icon: FiUser,        label: 'Profile' },
    ],
  },
]

const managerGroups = [
  {
    title: 'General',
    links: [
      { to: '/manager/dashboard',     icon: FiGrid,        label: 'Dashboard' },
      { to: '/manager/attendance',    icon: FiClock,       label: 'Attendance' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { to: '/manager/tasks',         icon: FiCheckSquare, label: 'Tasks' },
      { to: '/manager/notifications', icon: FiBell,        label: 'Notifications' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/manager/profile',       icon: FiUser,        label: 'Profile' },
    ],
  },
]

const employeeGroups = [
  {
    title: 'General',
    links: [
      { to: '/employee/dashboard',     icon: FiGrid,        label: 'Dashboard' },
      { to: '/employee/attendance',    icon: FiClock,       label: 'Attendance' },
      { to: '/employee/leave',         icon: FiCalendar,    label: 'Apply Leave' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { to: '/employee/tasks',         icon: FiCheckSquare, label: 'My Tasks' },
      { to: '/employee/report',        icon: FiFileText,    label: 'Daily Report' },
      { to: '/employee/productivity',  icon: FiTrendingUp,  label: 'Productivity' },
      { to: '/employee/notifications', icon: FiBell,        label: 'Notifications' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/employee/profile',       icon: FiUser,        label: 'Profile' },
    ],
  },
]

/* avatar initials + color */
const COLORS = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']
const getColor = name => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
const getInitials = name => (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const groups = user?.role === 'employee' ? employeeGroups : user?.role === 'manager' ? managerGroups : adminGroups
  const color = getColor(user?.name)
  const initials = getInitials(user?.name)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="sidebar-backdrop"
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:998, display:'none' }}
        />
      )}

      <aside
        className={`sidebar${open ? ' open' : ''}${collapsed ? ' collapsed' : ''}`}
        style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      >
        {/* ── BRAND ── */}
        <div className="sb-brand">
          <div className="sb-brand-icon">
            <FiActivity size={18} />
          </div>
          {!collapsed && (
            <div className="sb-brand-text">
              <strong>AI Productivity</strong>
              <span>Work Tracking</span>
            </div>
          )}
          {/* collapse toggle — desktop only */}
          <button
            className="sb-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
          </button>
        </div>

        {/* ── NAV GROUPS ── */}
        <nav className="sb-nav">
          {groups.map(group => (
            <div key={group.title} className="sb-group">
              {!collapsed && (
                <div className="sb-group-title">{group.title}</div>
              )}
              {group.links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  title={collapsed ? link.label : undefined}
                  className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
                >
                  <span className="sb-link-icon"><link.icon size={17} /></span>
                  {!collapsed && <span className="sb-link-label">{link.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── USER FOOTER ── */}
        <div className="sb-footer">
          <div className="sb-user" title={collapsed ? `${user?.name} · ${user?.role}` : undefined}>
            <div
              className="sb-avatar"
              style={{ background: color, flexShrink: 0 }}
            >
              {initials}
            </div>
            {!collapsed && (
              <div className="sb-user-info">
                <div className="sb-user-name">{user?.name}</div>
                <div className="sb-user-role">{user?.role} · {user?.department}</div>
              </div>
            )}
            {!collapsed && (
              <button className="sb-logout-btn" onClick={handleLogout} title="Logout">
                <FiLogOut size={15} />
              </button>
            )}
          </div>
          {collapsed && (
            <button className="sb-logout-btn sb-logout-center" onClick={handleLogout} title="Logout">
              <FiLogOut size={15} />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
