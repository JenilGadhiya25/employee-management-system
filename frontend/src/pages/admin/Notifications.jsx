import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiBell, FiPlus, FiCheck, FiClock, FiCalendar, FiFileText, FiCheckCircle, FiSend, FiUsers } from 'react-icons/fi'
import { getNotifications, createNotification } from '../../services/notificationService'
import { getEmployees } from '../../services/employeeService'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'
import useTitle from '../../hooks/useTitle'

const typeConfig = {
  task:       { icon: <FiCheckCircle />, color: '#6366f1', bg: '#f5f3ff', label: 'Task' },
  leave:      { icon: <FiCalendar />,   color: '#f59e0b', bg: '#fffbeb', label: 'Leave' },
  attendance: { icon: <FiClock />,      color: '#06b6d4', bg: '#ecfeff', label: 'Attendance' },
  report:     { icon: <FiFileText />,   color: '#10b981', bg: '#f0fdf4', label: 'Report' },
  general:    { icon: <FiBell />,       color: '#64748b', bg: '#f8fafc', label: 'General' },
}

const fmtTime = (d) => {
  const now  = new Date()
  const date = new Date(d)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const NotificationsAdmin = () => {
  useTitle('Notifications')
  const { user } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [showModal, setShowModal]         = useState(false)
  const [employees, setEmployees]         = useState([])
  const [form, setForm]                   = useState({ userId: '', message: '', type: 'general' })
  const [saving, setSaving]               = useState(false)
  const [filter, setFilter]               = useState('all')

  const load = async () => {
    try {
      const { data } = await getNotifications(user._id)
      setNotifications(data.data)
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    getEmployees().then(r => setEmployees(r.data.data)).catch(() => {})
  }, [])

  const handleSend = async () => {
    if (!form.userId || !form.message.trim()) { toast.error('Please fill all fields'); return }
    setSaving(true)
    try {
      await createNotification(form)
      toast.success('Notification sent successfully!')
      setShowModal(false)
      setForm({ userId: '', message: '', type: 'general' })
    } catch { toast.error('Failed to send notification') }
    finally { setSaving(false) }
  }

  const unread   = notifications.filter(n => !n.seen).length
  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.seen
    if (filter !== 'all')    return n.type === filter
    return true
  })

  const filters = [
    { key: 'all',    label: 'All',    count: notifications.length },
    { key: 'unread', label: 'Unread', count: unread },
    { key: 'task',   label: 'Tasks',  count: notifications.filter(n => n.type === 'task').length },
    { key: 'leave',  label: 'Leave',  count: notifications.filter(n => n.type === 'leave').length },
  ]

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-header-title">Notifications</div>
          <div className="page-header-subtitle">
            {unread > 0 ? `${unread} unread` : 'All caught up!'}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FiPlus style={{ fontSize: 16 }} />
          <span>Send Notification</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
              fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
              background: filter === f.key ? '#6366f1' : 'white',
              color: filter === f.key ? 'white' : '#64748b',
              border: filter === f.key ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            {f.label}
            {f.count > 0 && (
              <span style={{
                background: filter === f.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: filter === f.key ? 'white' : '#64748b',
                borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700,
              }}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.3 }}>🔔</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 6 }}>No notifications</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>You're all caught up!</div>
          </div>
        ) : (
          filtered.map((n, idx) => {
            const cfg = typeConfig[n.type] || typeConfig.general
            return (
              <div
                key={n._id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 20px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: !n.seen ? '#fafaf9' : 'white',
                  position: 'relative', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = !n.seen ? '#fafaf9' : 'white'}
              >
                {!n.seen && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#6366f1', borderRadius: '0 2px 2px 0' }} />
                )}

                <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                  {cfg.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 20 }}>
                      {cfg.label}
                    </span>
                    {!n.seen && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 13.5, color: '#0f172a', lineHeight: 1.5, fontWeight: n.seen ? 400 : 600 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiClock style={{ fontSize: 11 }} />
                    {fmtTime(n.createdAt)}
                  </div>
                </div>

                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {n.seen
                    ? <FiCheck style={{ fontSize: 14, color: '#cbd5e1' }} />
                    : <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }} />
                  }
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Send Notification Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Send Notification"
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              style={{ padding: '9px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#475569', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', background: saving ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 13.5, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <FiSend style={{ fontSize: 14 }} />
              <span>{saving ? 'Sending...' : 'Send'}</span>
            </button>
          </>
        }
      >
        {/* Recipient */}
        <div className="form-group">
          <label className="form-label-custom" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiUsers style={{ color: '#6366f1', fontSize: 13 }} /> Send To
          </label>
          <select
            className="form-control-custom"
            value={form.userId}
            onChange={e => setForm({ ...form, userId: e.target.value })}
          >
            <option value="">Select employee...</option>
            {employees.map(e => (
              <option key={e._id} value={e._id}>{e.name} — {e.department}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="form-group">
          <label className="form-label-custom">Notification Type</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm({ ...form, type: key })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px', borderRadius: 9, cursor: 'pointer',
                  fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                  background: form.type === key ? cfg.bg : 'white',
                  color: form.type === key ? cfg.color : '#64748b',
                  border: form.type === key ? `1.5px solid ${cfg.color}` : '1.5px solid #e2e8f0',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 13 }}>{cfg.icon}</span>
                <span style={{ textTransform: 'capitalize' }}>{key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label-custom" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiBell style={{ color: '#6366f1', fontSize: 13 }} /> Message
          </label>
          <textarea
            className="form-control-custom"
            rows={4}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="Write your notification message here..."
            style={{ resize: 'vertical' }}
          />
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>
            {form.message.length} characters
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default NotificationsAdmin
