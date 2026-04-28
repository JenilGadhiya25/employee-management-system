import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiUser,
  FiBriefcase, FiActivity, FiArrowRight, FiCheck,
  FiCalendar, FiMapPin,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import useTitle from '../../hooks/useTitle'
import Spinner from '../../components/Spinner'

/* ─── Shared input component ─────────────────────────────────────────────── */
const Input = ({ icon, type = 'text', placeholder, value, onChange, error, rightEl }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15, pointerEvents: 'none', zIndex: 1 }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%', padding: '12px 14px 12px 42px',
          border: error ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
          borderRadius: 12, fontSize: 13.5, color: '#0f172a',
          background: 'white', outline: 'none', fontFamily: 'inherit',
          paddingRight: rightEl ? 44 : 14,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
        onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
      />
      {rightEl && (
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8' }}>
          {rightEl}
        </span>
      )}
    </div>
    {error && <div style={{ color: '#ef4444', fontSize: 11.5, marginTop: 4, paddingLeft: 2 }}>{error}</div>}
  </div>
)

/* ─── Features list shown on left panel ─────────────────────────────────── */
const features = [
  { icon: '🕐', text: 'Smart Clock In / Out with sessions' },
  { icon: '📊', text: 'Real-time productivity analytics' },
  { icon: '✅', text: 'Task assignment & tracking' },
  { icon: '📅', text: 'Leave management & approvals' },
  { icon: '🔔', text: 'Instant notifications' },
  { icon: '📋', text: 'Daily report submission' },
]

/* ─── Main Auth Page (Login + Register with slider) ─────────────────────── */
const Login = () => {
  useTitle('Sign In')
  const { login, register } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  // Toggle: 'login' | 'register'
  const [mode, setMode] = useState('login')

  // Login form
  const [loginForm, setLoginForm]   = useState({ email: '', password: '' })
  const [showPass, setShowPass]     = useState(false)
  const [loginErrors, setLoginErrors] = useState({})
  const [loginLoading, setLoginLoading] = useState(false)

  // Register form
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '', designation: '', gender: '', dob: '', location: '' })
  const [showRegPass, setShowRegPass] = useState(false)
  const [regErrors, setRegErrors]   = useState({})
  const [regLoading, setRegLoading] = useState(false)

  /* ── Login submit ── */
  const handleLogin = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!loginForm.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = 'Invalid email'
    if (!loginForm.password) errs.password = 'Password is required'
    setLoginErrors(errs)
    if (Object.keys(errs).length) return

    setLoginLoading(true)
    try {
      const user = await login(loginForm.email, loginForm.password)
      toast.success(`Welcome back, ${user.name}! 👋`)
      const from = location.state?.from?.pathname
      let redirectPath = '/login'
      if (user.role === 'admin') redirectPath = '/admin/dashboard'
      else if (user.role === 'manager') redirectPath = '/manager/dashboard'
      else if (user.role === 'employee') redirectPath = '/employee/dashboard'
      navigate(from && from !== '/' ? from : redirectPath, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoginLoading(false) }
  }

  /* ── Register submit ── */
  const handleRegister = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!regForm.name.trim()) errs.name = 'Name is required'
    if (!regForm.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) errs.email = 'Invalid email'
    if (!regForm.password || regForm.password.length < 6) errs.password = 'Min. 6 characters'
    if (!regForm.department.trim()) errs.department = 'Required'
    if (!regForm.designation.trim()) errs.designation = 'Required'
    setRegErrors(errs)
    if (Object.keys(errs).length) return

    setRegLoading(true)
    try {
      const user = await register(regForm)
      toast.success('Account created! Welcome aboard 🎉')
      let redirectPath = '/login'
      if (user.role === 'admin') redirectPath = '/admin/dashboard'
      else if (user.role === 'manager') redirectPath = '/manager/dashboard'
      else if (user.role === 'employee') redirectPath = '/employee/dashboard'
      navigate(redirectPath)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setRegLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Inter, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', top: -200, right: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', bottom: -150, left: -100, pointerEvents: 'none' }} />

      {/* Main card */}
      <div style={{
        width: '100%', maxWidth: 960,
        background: 'white', borderRadius: 24,
        overflow: 'hidden', display: 'flex',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        minHeight: 580,
        position: 'relative', zIndex: 1,
      }}>

        {/* ── LEFT PANEL (features) ── */}
        <div style={{
          width: '42%', flexShrink: 0,
          background: 'linear-gradient(160deg, #6366f1 0%, #4f46e5 40%, #4338ca 100%)',
          padding: '48px 40px', color: 'white',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -100, right: -100 }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: 50, left: -80 }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, backdropFilter: 'blur(10px)' }}>
                <FiActivity />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>AI Productivity</div>
                <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 400 }}>Work Tracking System</div>
              </div>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.02em' }}>
              Track. Manage.<br />Grow Together.
            </h2>
            <p style={{ fontSize: 13.5, opacity: 0.8, lineHeight: 1.7, marginBottom: 32 }}>
              The all-in-one platform for employee productivity, attendance, and performance management.
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize: 13, opacity: 0.9 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Trusted by teams worldwide</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.4)', marginLeft: i > 0 ? -8 : 0 }} />
              ))}
              <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 8, alignSelf: 'center' }}>+500 users</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (forms) ── */}
        <div style={{ flex: 1, padding: '48px 44px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          {/* ── TOGGLE SLIDER ── */}
          <div style={{
            display: 'flex', background: '#f1f5f9', borderRadius: 14,
            padding: 4, marginBottom: 36, position: 'relative',
          }}>
            {/* Sliding pill */}
            <div style={{
              position: 'absolute', top: 4, bottom: 4,
              width: 'calc(50% - 4px)',
              left: mode === 'login' ? 4 : 'calc(50%)',
              background: 'white',
              borderRadius: 11,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
            }} />
            {[
              { key: 'login', label: 'Sign In' },
              { key: 'register', label: 'Create Account' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                style={{
                  flex: 1, padding: '11px 0',
                  border: 'none', background: 'transparent',
                  fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                  color: mode === tab.key ? '#4f46e5' : '#64748b',
                  borderRadius: 11, position: 'relative', zIndex: 1,
                  transition: 'color 0.3s',
                  fontFamily: 'inherit',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <div style={{ animation: 'slideUp 0.3s ease' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Welcome back 👋
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 28 }}>
                Sign in to your account to continue
              </p>

              <form onSubmit={handleLogin} noValidate>
                <Input
                  icon={<FiMail />}
                  type="email"
                  placeholder="you@company.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  error={loginErrors.email}
                />
                <Input
                  icon={<FiLock />}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  error={loginErrors.password}
                  rightEl={
                    <span onClick={() => setShowPass(!showPass)}>
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </span>
                  }
                />

                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{
                    width: '100%', padding: '13px 20px',
                    background: loginLoading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color: 'white', border: 'none', borderRadius: 12,
                    fontSize: 14.5, fontWeight: 700, cursor: loginLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                    marginTop: 8,
                  }}
                  onMouseEnter={e => { if (!loginLoading) e.target.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
                >
                  {loginLoading ? <><Spinner size="sm" center={false} /> Signing in...</> : <>Sign In <FiArrowRight /></>}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                Don't have an account?{' '}
                <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                  Create one →
                </button>
              </div>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === 'register' && (
            <div style={{ animation: 'slideUp 0.3s ease' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Create account 🚀
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 24 }}>
                Join your team's productivity platform
              </p>

              <form onSubmit={handleRegister} noValidate>
                <Input icon={<FiUser />} placeholder="Full Name" value={regForm.name}
                  onChange={e => setRegForm({ ...regForm, name: e.target.value })} error={regErrors.name} />
                <Input icon={<FiMail />} type="email" placeholder="Email Address" value={regForm.email}
                  onChange={e => setRegForm({ ...regForm, email: e.target.value })} error={regErrors.email} />
                <Input icon={<FiLock />} type={showRegPass ? 'text' : 'password'} placeholder="Password (min. 6 chars)"
                  value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                  error={regErrors.password}
                  rightEl={<span onClick={() => setShowRegPass(!showRegPass)}>{showRegPass ? <FiEyeOff /> : <FiEye />}</span>}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
                  <Input icon={<FiBriefcase />} placeholder="Department" value={regForm.department}
                    onChange={e => setRegForm({ ...regForm, department: e.target.value })} error={regErrors.department} />
                  <Input icon={<FiUser />} placeholder="Designation" value={regForm.designation}
                    onChange={e => setRegForm({ ...regForm, designation: e.target.value })} error={regErrors.designation} />
                </div>

                {/* Gender + DOB */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15, pointerEvents: 'none', zIndex: 1 }}>
                        <FiUser />
                      </span>
                      <select
                        value={regForm.gender}
                        onChange={e => setRegForm({ ...regForm, gender: e.target.value })}
                        style={{
                          width: '100%', padding: '12px 14px 12px 42px',
                          border: '1.5px solid #e2e8f0', borderRadius: 12,
                          fontSize: 13.5, color: regForm.gender ? '#0f172a' : '#94a3b8',
                          background: 'white', outline: 'none', fontFamily: 'inherit',
                          appearance: 'none', cursor: 'pointer',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                      >
                        <option value="">Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15, pointerEvents: 'none', zIndex: 1 }}>
                        <FiCalendar />
                      </span>
                      <input
                        type="date"
                        value={regForm.dob}
                        onChange={e => setRegForm({ ...regForm, dob: e.target.value })}
                        style={{
                          width: '100%', padding: '12px 14px 12px 42px',
                          border: '1.5px solid #e2e8f0', borderRadius: 12,
                          fontSize: 13.5, color: regForm.dob ? '#0f172a' : '#94a3b8',
                          background: 'white', outline: 'none', fontFamily: 'inherit',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <Input icon={<FiMapPin />} placeholder="Location (City, Country)" value={regForm.location}
                  onChange={e => setRegForm({ ...regForm, location: e.target.value })} />

                {/* Role selector */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Select Role</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['employee', 'manager', 'admin'].map(r => (
                      <button
                        key={r} type="button"
                        onClick={() => setRegForm({ ...regForm, role: r })}
                        style={{
                          flex: 1, padding: '9px 0',
                          border: regForm.role === r ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                          borderRadius: 10, background: regForm.role === r ? '#f5f3ff' : 'white',
                          color: regForm.role === r ? '#4f46e5' : '#64748b',
                          fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                          textTransform: 'capitalize', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          transition: 'all 0.2s',
                        }}
                      >
                        {regForm.role === r && <FiCheck style={{ fontSize: 12 }} />}
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  style={{
                    width: '100%', padding: '13px 20px',
                    background: regLoading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color: 'white', border: 'none', borderRadius: 12,
                    fontSize: 14.5, fontWeight: 700, cursor: regLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                >
                  {regLoading ? <><Spinner size="sm" center={false} /> Creating...</> : <>Create Account <FiArrowRight /></>}
                </button>
              </form>

              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                Already have an account?{' '}
                <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                  Sign in →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Login
