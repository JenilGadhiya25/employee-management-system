import { useState, useEffect } from 'react'
import { FiBell, FiCheckCircle } from 'react-icons/fi'
import { getNotifications } from '../../services/notificationService'
import { useAuth } from '../../context/AuthContext'

const ManagerNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNotifications(user?._id)
        setNotifications(res.data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (user?._id) load()
  }, [user?._id])

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:16 }}>
      <div className="spinner" />
      <p style={{ color:'#94a3b8', fontSize:13 }}>Loading notifications…</p>
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Notifications</h1>
          <p className="page-header-subtitle">Stay updated with team activities</p>
        </div>
      </div>

      <div className="card">
        {notifications.length > 0 ? (
          <div>
            {notifications.map(notif => (
              <div
                key={notif._id}
                className="notif-item"
                style={{ background: notif.read ? 'white' : '#f5f3ff' }}
              >
                <div className={`notif-dot ${notif.read ? 'read' : ''}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <FiBell size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerNotifications
