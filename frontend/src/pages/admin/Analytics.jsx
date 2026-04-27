import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import dashboardService from '../../services/dashboardService'
import Avatar from '../../components/Avatar'
import ProgressBar from '../../components/ProgressBar'
import Spinner from '../../components/Spinner'
import useTitle from '../../hooks/useTitle'

const Analytics = () => {
  useTitle('Analytics')
  const [productivity, setProductivity] = useState([])
  const [attendance, setAttendance] = useState([])
  const [taskSummary, setTaskSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const load = async () => {
    setLoading(true)
    try {
      const [p, a, t] = await Promise.all([
        dashboardService.getProductivity(month, year),
        dashboardService.getMonthlyAttendance(month, year),
        dashboardService.getTaskSummary(),
      ])
      setProductivity(p.data.data)
      setAttendance(a.data.data)
      setTaskSummary(t.data.data)
    } catch { toast.error('Failed to load analytics') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [month, year])

  const chartData = attendance.map(a => ({
    name: a.name?.split(' ')[0],
    Present: a.presentDays,
    Leave: a.leaveDays,
    Hours: Math.round(a.totalHours),
  }))

  const prodChartData = productivity.map(p => ({
    name: p.name?.split(' ')[0],
    Score: p.avgProductivityScore,
  }))

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-header-title">Productivity Analytics</div>
          <div className="page-header-subtitle">Deep insights into team performance</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-control-custom" style={{ width: 120 }} value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select className="form-control-custom" style={{ width: 100 }} value={year} onChange={e => setYear(e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header-custom"><div className="card-title">Attendance Overview</div></div>
                <div style={{ padding: '16px 8px' }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Present" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Leave" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header-custom"><div className="card-title">Productivity Scores</div></div>
                <div style={{ padding: '16px 8px' }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={prodChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                      <Bar dataKey="Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header-custom"><div className="card-title">Employee Productivity Leaderboard</div></div>
            <div style={{ padding: '0 0 8px' }}>
              {productivity.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No productivity data available</div>
              ) : productivity.map((p, i) => (
                <div key={p.employeeId} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? ['#fbbf24', '#94a3b8', '#cd7c2f'][i] : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i < 3 ? 'white' : '#64748b', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <Avatar name={p.name} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.department} · {p.totalReports} reports</div>
                  </div>
                  <div style={{ width: 160 }}>
                    <ProgressBar value={p.avgProductivityScore} showLabel={false}
                      color={p.avgProductivityScore >= 70 ? '#10b981' : p.avgProductivityScore >= 40 ? '#f59e0b' : '#ef4444'} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: p.avgProductivityScore >= 70 ? '#10b981' : p.avgProductivityScore >= 40 ? '#f59e0b' : '#ef4444', minWidth: 48, textAlign: 'right' }}>
                    {p.avgProductivityScore}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Analytics
