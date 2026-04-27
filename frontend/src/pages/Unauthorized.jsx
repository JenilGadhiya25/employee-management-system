import { useNavigate } from 'react-router-dom'
import { FiShield } from 'react-icons/fi'

const Unauthorized = () => {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, color: '#ef4444', marginBottom: 16 }}><FiShield /></div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>You don't have permission to access this page.</p>
        <button className="btn-primary-custom" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  )
}
export default Unauthorized
