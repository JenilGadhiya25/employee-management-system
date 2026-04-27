// Reusable button with properly aligned icon + text
const Btn = ({ icon, children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style = {} }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.2s',
    lineHeight: 1, whiteSpace: 'nowrap', flexShrink: 0,
    opacity: disabled ? 0.65 : 1,
  }

  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12, borderRadius: 8 },
    md: { padding: '9px 18px', fontSize: 13.5, borderRadius: 10 },
    lg: { padding: '12px 24px', fontSize: 14.5, borderRadius: 12 },
    icon: { padding: '7px 10px', fontSize: 14, borderRadius: 9 },
  }

  const variants = {
    primary: {
      background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg,#ef4444,#dc2626)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
    },
    success: {
      background: 'linear-gradient(135deg,#10b981,#059669)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
    },
    outline: {
      background: 'white',
      color: '#475569',
      border: '1.5px solid #e2e8f0',
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: '#6366f1',
      boxShadow: 'none',
    },
    warning: {
      background: 'linear-gradient(135deg,#f59e0b,#d97706)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
    },
  }

  const s = { ...base, ...sizes[size], ...variants[variant], ...style }

  const handleMouseEnter = (e) => {
    if (disabled) return
    if (variant === 'primary') e.currentTarget.style.transform = 'translateY(-1px)'
    if (variant === 'danger')  e.currentTarget.style.transform = 'translateY(-1px)'
    if (variant === 'success') e.currentTarget.style.transform = 'translateY(-1px)'
    if (variant === 'outline') { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1' }
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)'
    if (variant === 'outline') { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0' }
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={s}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center', fontSize: size === 'sm' ? 13 : 15, flexShrink: 0 }}>{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  )
}

export default Btn
