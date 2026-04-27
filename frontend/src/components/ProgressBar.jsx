const ProgressBar = ({ value = 0, color = '#4f46e5', showLabel = true }) => (
  <div>
    {showLabel && (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>Progress</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{value}%</span>
      </div>
    )}
    <div className="progress-custom">
      <div className="progress-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  </div>
)

export default ProgressBar
