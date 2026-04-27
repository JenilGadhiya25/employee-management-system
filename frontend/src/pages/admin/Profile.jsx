import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  FiEdit2, FiSave, FiX, FiMail, FiBriefcase, FiMapPin,
  FiCalendar, FiUser, FiShield, FiClock, FiHash, FiCheck, FiCamera,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { updateEmployee } from '../../services/employeeService'
import useTitle from '../../hooks/useTitle'

const GENDER_ICON = { male: '♂', female: '♀', other: '⚧', '': '—' }

const roleColor = r => r === 'admin' ? { bg:'#fef2f2', color:'#b91c1c', border:'#fecaca' }
  : r === 'manager' ? { bg:'#fffbeb', color:'#a16207', border:'#fde68a' }
  : { bg:'#f0fdf4', color:'#15803d', border:'#86efac' }

const avatarColors = [
  ['#6366f1','#8b5cf6'], ['#0ea5e9','#06b6d4'], ['#10b981','#34d399'],
  ['#f59e0b','#fbbf24'], ['#ef4444','#f87171'],
]
const getAvatarGrad = name => {
  const i = (name?.charCodeAt(0) || 0) % avatarColors.length
  return avatarColors[i]
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f1f5f9' }}>
    <div style={{ width:32, height:32, borderRadius:9, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={14} color="#6366f1" />
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:10.5, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
      <div style={{ fontSize:13.5, color:'#0f172a', fontWeight:600, marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value || '—'}</div>
    </div>
  </div>
)

const Profile = () => {
  useTitle('Profile')
  const { user, fetchMe } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null)
  const [form, setForm] = useState({
    name:        user?.name        || '',
    department:  user?.department  || '',
    designation: user?.designation || '',
    gender:      user?.gender      || '',
    dob:         user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    location:    user?.location    || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
        setForm(f => ({ ...f, profilePhoto: event.target?.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await updateEmployee(user._id, form)
      await fetchMe()
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally { setSaving(false) }
  }

  const handleCancel = () => {
    setForm({
      name: user?.name || '', department: user?.department || '',
      designation: user?.designation || '', gender: user?.gender || '',
      dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      location: user?.location || '',
    })
    setEditing(false)
  }

  const [c1, c2] = getAvatarGrad(user?.name)
  const rc = roleColor(user?.role)
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' }) : '—'
  const dobDisplay = user?.dob ? new Date(user.dob).toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' }) : '—'

  return (
    <div className="fade-in" style={{ maxWidth: 1100 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:21, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>Profile</div>
          <div style={{ fontSize:13, color:'#94a3b8', marginTop:3 }}>Manage your personal information</div>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-primary-custom">
            <FiEdit2 size={14} /> Edit Profile
          </button>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleCancel} className="btn-outline-custom"><FiX size={14} /> Cancel</button>
            <button onClick={handleSave} className="btn-primary-custom" disabled={saving}>
              {saving ? 'Saving…' : <><FiSave size={14} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:20, alignItems:'start' }}>

        {/* ── LEFT CARD ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Avatar card */}
          <div className="card" style={{ overflow:'hidden' }}>
            {/* cover gradient */}
            <div style={{
              height:100,
              background:`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
              position:'relative',
            }}>
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.08)' }} />
            </div>

            <div style={{ padding:'0 24px 24px', textAlign:'center', marginTop:-44 }}>
              {/* avatar circle */}
              <div style={{
                width:88, height:88, borderRadius:'50%',
                background: photoPreview ? `url(${photoPreview})` : `linear-gradient(135deg, ${c1}, ${c2})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                fontSize:28, fontWeight:800, color:'white',
                border:'4px solid white',
                boxShadow:'0 4px 16px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
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

              <h3 style={{ margin:'12px 0 4px', fontSize:18, fontWeight:800, color:'#0f172a' }}>{user?.name}</h3>
              <div style={{ fontSize:13, color:'#64748b', marginBottom:10 }}>{user?.designation}</div>

              {/* role badge */}
              <span style={{
                display:'inline-flex', alignItems:'center', gap:5,
                background:rc.bg, color:rc.color, border:`1px solid ${rc.border}`,
                borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700,
                textTransform:'capitalize',
              }}>
                <FiShield size={11} /> {user?.role}
              </span>

              {/* employee ID */}
              {user?.employeeId && (
                <div style={{
                  marginTop:14, background:'#f8fafc', border:'1px solid #e2e8f0',
                  borderRadius:10, padding:'8px 14px',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                }}>
                  <FiHash size={12} color="#6366f1" />
                  <span style={{ fontSize:12.5, fontWeight:700, color:'#6366f1', letterSpacing:'0.05em' }}>{user.employeeId}</span>
                </div>
              )}
            </div>
          </div>

          {/* General Info card */}
          <div className="card" style={{ padding:'16px 20px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
              General Info
            </div>
            <InfoRow icon={FiMail}     label="Email"       value={user?.email} />
            <InfoRow icon={FiUser}     label="Gender"      value={user?.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : '—'} />
            <InfoRow icon={FiCalendar} label="Date of Birth" value={dobDisplay} />
            <InfoRow icon={FiMapPin}   label="Location"    value={user?.location} />
            <InfoRow icon={FiBriefcase} label="Department" value={user?.department} />
            <InfoRow icon={FiClock}    label="Member Since" value={memberSince} />
          </div>
        </div>

        {/* ── RIGHT CARD ── */}
        <div className="card">
          <div style={{
            padding:'18px 24px', borderBottom:'1px solid #f1f5f9',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FiEdit2 size={16} color="#6366f1" />
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14.5, color:'#0f172a' }}>
                {editing ? 'Edit Information' : 'Personal Information'}
              </div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>
                {editing ? 'Update your profile details below' : 'Your current profile details'}
              </div>
            </div>
          </div>

          <div style={{ padding:24 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

              {/* Full Name */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Full Name</label>
                {editing ? (
                  <input className="form-control-custom" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Full name" />
                ) : (
                  <div style={viewStyle}>{user?.name || '—'}</div>
                )}
              </div>

              {/* Department */}
              <div>
                <label style={labelStyle}>Department</label>
                {editing ? (
                  <input className="form-control-custom" value={form.department} onChange={e=>set('department',e.target.value)} placeholder="Department" />
                ) : (
                  <div style={viewStyle}>{user?.department || '—'}</div>
                )}
              </div>

              {/* Designation */}
              <div>
                <label style={labelStyle}>Designation</label>
                {editing ? (
                  <input className="form-control-custom" value={form.designation} onChange={e=>set('designation',e.target.value)} placeholder="Designation" />
                ) : (
                  <div style={viewStyle}>{user?.designation || '—'}</div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label style={labelStyle}>Gender</label>
                {editing ? (
                  <select className="form-control-custom" value={form.gender} onChange={e=>set('gender',e.target.value)} style={{ cursor:'pointer' }}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div style={viewStyle}>{user?.gender ? user.gender.charAt(0).toUpperCase()+user.gender.slice(1) : '—'}</div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label style={labelStyle}>Date of Birth</label>
                {editing ? (
                  <input type="date" className="form-control-custom" value={form.dob} onChange={e=>set('dob',e.target.value)} />
                ) : (
                  <div style={viewStyle}>{dobDisplay}</div>
                )}
              </div>

              {/* Location */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Location</label>
                {editing ? (
                  <input className="form-control-custom" value={form.location} onChange={e=>set('location',e.target.value)} placeholder="City, Country" />
                ) : (
                  <div style={viewStyle}>{user?.location || '—'}</div>
                )}
              </div>

              {/* Email (read-only) */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ ...viewStyle, background:'#f8fafc', color:'#94a3b8' }}>{user?.email}</div>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Email cannot be changed</div>
              </div>

              {/* Employee ID (read-only) */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Employee ID</label>
                <div style={{ ...viewStyle, background:'#f5f3ff', color:'#6366f1', fontWeight:700, letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:6 }}>
                  <FiHash size={13} /> {user?.employeeId || 'Auto-generated on registration'}
                </div>
              </div>

            </div>

            {editing && (
              <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid #f1f5f9', display:'flex', gap:10 }}>
                <button onClick={handleSave} className="btn-primary-custom" disabled={saving}>
                  {saving ? 'Saving…' : <><FiCheck size={14} /> Save Changes</>}
                </button>
                <button onClick={handleCancel} className="btn-outline-custom"><FiX size={14} /> Cancel</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

const labelStyle = { fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }
const viewStyle  = { padding:'10px 14px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13.5, color:'#0f172a', fontWeight:500, minHeight:42 }

export default Profile
