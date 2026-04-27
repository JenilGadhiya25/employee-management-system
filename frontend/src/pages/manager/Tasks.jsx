import { useState, useEffect } from 'react'
import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import dashboardService from '../../services/dashboardService'

const ManagerTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getTaskSummary()
        setTasks(res.data.data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:16 }}>
      <div className="spinner" />
      <p style={{ color:'#94a3b8', fontSize:13 }}>Loading tasks…</p>
    </div>
  )

  const totalCompleted = tasks.reduce((sum, t) => sum + (t.completed || 0), 0)
  const totalInProgress = tasks.reduce((sum, t) => sum + (t.inProgress || 0), 0)
  const totalPending = tasks.reduce((sum, t) => sum + (t.pending || 0), 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Team Tasks</h1>
          <p className="page-header-subtitle">Manage and track team tasks</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#f5f3ff', color:'#6366f1' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalCompleted}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#fffbeb', color:'#f59e0b' }}>
            <FiClock />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalInProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#fef2f2', color:'#ef4444' }}>
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalPending}</div>
            <div className="stat-label">Pending Tasks</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <div className="card-title">Team Task Summary</div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Pending</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((emp, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td><span className="badge-success">{emp.completed || 0}</span></td>
                  <td><span className="badge-info">{emp.inProgress || 0}</span></td>
                  <td><span className="badge-warning">{emp.pending || 0}</span></td>
                  <td><strong>{emp.total || 0}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManagerTasks
