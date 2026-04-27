import { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { updateEmployee } from '../../services/employeeService'
import { FiEdit2, FiCheck, FiX, FiCamera } from 'react-icons/fi'

const ManagerProfile = () => {
  const { user, fetchMe } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    designation: user?.designation || '',
    gender: user?.gender || '',
    dob: user?.dob ? user.dob.split('T')[0] : '',
    location: user?.location || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result)
        setFormData(f => ({ ...f, profilePhoto: event.target?.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateEmployee(user._id, formData)
      await fetchMe()
      toast.success('Profile updated!')
      setEditing(false)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']
  const getColor = name => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
  const getInitials = name => (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const color = getColor(user?.name)
  const initials = getInitials(user?.name)

  return (
    <div className="fade-in" style={{ maxWidth: 1000 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left Panel */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="profile-cover" />
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div
              style={{
                width: 82, height: 82, borderRadius: 22,
                background: photoPreview ? `url(${photoPreview})` : color,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 28,
                margin: '-41px auto 16px', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!photoPreview && initials}
              {editing && (
                <label style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s',
                  fontSize: 24
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                >
                  <FiCamera size={24} color="white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, textTransform: 'capitalize' }}>
              {user?.role} · {user?.department}
            </p>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Employee ID</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>#{user?.employeeId}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Department</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{user?.department}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Designation</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{user?.designation}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Location</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{user?.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="card">
          <div className="card-header-custom">
            <div className="card-title">Profile Information</div>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: editing ? '#f1f5f9' : '#f5f3ff',
                color: editing ? '#64748b' : '#6366f1',
                border: 'none', borderRadius: 8, padding: '6px 12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit'
              }}
            >
              <FiEdit2 size={14} /> {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          <div style={{ padding: '24px' }}>
            <div className="form-group">
              <label className="form-label-custom">Full Name</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                disabled={!editing}
                className="form-control-custom"
                style={{ background: editing ? 'white' : '#f8fafc', cursor: editing ? 'text' : 'default' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Email</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                disabled={!editing}
                className="form-control-custom"
                style={{ background: editing ? 'white' : '#f8fafc', cursor: editing ? 'text' : 'default' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Phone</label>
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                disabled={!editing}
                className="form-control-custom"
                style={{ background: editing ? 'white' : '#f8fafc', cursor: editing ? 'text' : 'default' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Gender</label>
              <select
                name="gender" value={formData.gender} onChange={handleChange}
                disabled={!editing}
                className="form-control-custom"
                style={{ background: editing ? 'white' : '#f8fafc', cursor: editing ? 'pointer' : 'default' }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label-custom">Date of Birth</label>
              <input
                type="date" name="dob" value={formData.dob} onChange={handleChange}
                disabled={!editing}
                className="form-control-custom"
                style={{ background: editing ? 'white' : '#f8fafc', cursor: editing ? 'text' : 'default' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Location</label>
              <input
                type="text" name="location" value={formData.location} onChange={handleChange}
                disabled={!editing}
                className="form-control-custom"
                style={{ background: editing ? 'white' : '#f8fafc', cursor: editing ? 'text' : 'default' }}
              />
            </div>
            {editing && (
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button
                  onClick={handleSave} disabled={loading}
                  className="btn-primary-custom"
                  style={{ flex: 1 }}
                >
                  <FiCheck size={14} /> Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-outline-custom"
                  style={{ flex: 1 }}
                >
                  <FiX size={14} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerProfile
