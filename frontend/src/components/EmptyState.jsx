const EmptyState = ({ icon = '📭', title = 'No data found', text = '' }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <div className="empty-state-title">{title}</div>
    {text && <div className="empty-state-text">{text}</div>}
  </div>
)
export default EmptyState
