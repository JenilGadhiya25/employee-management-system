import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBell, FiMenu, FiLogOut, FiUser, FiSearch } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../services/notificationService'

const COLORS = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']
const getColor = name => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
const getInitials = name => (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const Topbar = ({ title, onMenuClick, collapsed }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (user?._id) {
      getNotifications(user._id)
        .then(res => {
          const unreadCount = res.data.data?.filter(n => !n.seen).length || 0
          setNotifCount(unreadCount)
        })
        .catch(err => console.error(err))
    }
  }, [user?._id])

  const handleLogout = () => { logout(); navigate('/login') }
  const notifPath   = user?.role === 'employee' ? '/employee/notifications' : '/admin/notifications'
  const profilePath = user?.role === 'employee' ? '/employee/profile'       : '/admin/profile'
  const color       = getColor(user?.name)
  const initials    = getInitials(user?.name)

  const handleNotificationClick = () => {
    navigate(notifPath)
    // Reset notification count after navigating
    setTimeout(() => setNotifCount(0), 100)
  }

  return (
    <header className={`topbar${collapsed ? ' collapsed' : ''}`}>
      {/* Mobile hamburger */}
      <button className="topbar-btn" onClick={onMenuClick} id="sidebar-toggle" style={{ border:'none', display:'none' }}>
        <FiMenu size={18} />
      </button>

      <div className="topbar-title">{title}</div>

      {/* Search bar */}
      <div className="topbar-search">
        <FiSearch size={14} style={{ color:'#94a3b8', flexShrink:0 }} />
        <input placeholder="Search anything…" />
      </div>

      <div className="topbar-actions">
        {/* Bell */}
        <button className="topbar-btn" onClick={handleNotificationClick} title="Notifications" style={{ position: 'relative' }}>
          <FiBell size={17} />
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: 'white',
              borderRadius: '50%', width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, border: '2px solid white'
            }}>
              {notifCount > 99 ? '99+' : notifCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div style={{ position:'relative' }} ref={dropRef}>
          <div
            className="topbar-avatar"
            onClick={() => setDropOpen(!dropOpen)}
            title={user?.name}
            style={{ background: color, cursor:'pointer' }}
          >
            {initials}
          </div>

          {dropOpen && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 10px)',
              background:'white', border:'1px solid #e2e8f0', borderRadius:14,
              boxShadow:'0 12px 32px rgba(0,0,0,0.12)', minWidth:210, zIndex:1001, overflow:'hidden',
            }}>
              {/* user info header */}
              <div style={{ padding:'14px 16px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13, flexShrink:0 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{user?.name}</div>
                  <div style={{ fontSize:11, color:'#94a3b8', textTransform:'capitalize', marginTop:1 }}>
                    {user?.role} · {user?.department}
                  </div>
                </div>
              </div>

              {[
                { icon: FiUser,   label: 'Profile',  action: () => { navigate(profilePath); setDropOpen(false) }, color: '#334155' },
                { icon: FiLogOut, label: 'Logout',   action: handleLogout, color: '#ef4444' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width:'100%', padding:'11px 16px', border:'none', background:'none',
                    textAlign:'left', fontSize:13, cursor:'pointer',
                    display:'flex', alignItems:'center', gap:9, color:item.color,
                    fontFamily:'inherit', transition:'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = item.color === '#ef4444' ? '#fef2f2' : '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
