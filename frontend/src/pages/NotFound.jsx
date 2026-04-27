import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>404</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8, marginTop: 12 }}>Page Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <button className="btn-primary-custom" onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  )
}
export default NotFound
