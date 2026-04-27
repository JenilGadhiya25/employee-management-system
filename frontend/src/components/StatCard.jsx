const StatCard = ({ icon, label, value, color = 'blue', change, changeType }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${changeType}`}>{change}</div>
      )}
    </div>
  </div>
)
export default StatCard
