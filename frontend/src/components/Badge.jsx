const colorMap = {
  present: 'badge-success',
  approved: 'badge-success',
  completed: 'badge-success',
  active: 'badge-success',
  pending: 'badge-warning',
  'in-progress': 'badge-info',
  absent: 'badge-danger',
  rejected: 'badge-danger',
  cancelled: 'badge-danger',
  leave: 'badge-purple',
  'half-day': 'badge-secondary',
  low: 'badge-secondary',
  medium: 'badge-info',
  high: 'badge-warning',
  urgent: 'badge-danger',
  admin: 'badge-purple',
  manager: 'badge-info',
  employee: 'badge-secondary',
}

const Badge = ({ value }) => {
  const cls = colorMap[value] || 'badge-secondary'
  return <span className={`badge-custom ${cls}`}>{value}</span>
}

export default Badge
