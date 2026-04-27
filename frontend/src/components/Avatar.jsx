const colors = ['#4f46e5','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']

const Avatar = ({ name = '', size = 'md' }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const color = colors[name.charCodeAt(0) % colors.length]
  const cls = size === 'sm' ? 'avatar avatar-sm' : size === 'lg' ? 'avatar avatar-lg' : size === 'xl' ? 'avatar avatar-xl' : 'avatar'
  return (
    <div className={cls} style={{ background: color }}>{initials}</div>
  )
}

export default Avatar
