import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getReportsByEmployee } from '../../services/reportService'
import { getAttendanceByEmployee } from '../../services/attendanceService'
import { getTasksByEmployee } from '../../services/taskService'
import { useAuth } from '../../context/AuthContext'
import ProgressBar from '../../components/ProgressBar'
import Spinner from '../../components/Spinner'
import useTitle from '../../hooks/useTitle'

const MyProductivity = () => {
  useTitle('My Productivity')
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [tasks, setTasks] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const load = async () => {
    setLoading(true)
    try {
      const [r, t, a] = await Promise.all([
        getReportsByEmployee(user._id, { month, year }),
        getTasksByEmployee(user._id),
        getAttendanceByEmployee(user._id, { month, year }),
      ])
      setReports(r.data.data)
      setTasks(t.data.data)
      setAttendance(a.data.data)
    } catch { toast.error('Failed to load productivity data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [month, year, user._id])

  const avgScore = reports.length ? Math.round(reports.reduce((s, r) => s + r.productivityScore, 0) / reports.length) : 0
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const presentDays = attendance.filter(a => a.status === 'present').length
  const totalHours = attendance.reduce((s, a) => s + (a.totalHours || 0), 0).toFixed(1)

  const chartData = [...reports].reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Score: r.productivityScore,
  }))

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-title">My Productivity</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-control-custom" style={{ width: 130 }} value={month} onChange={e => setMonth(e.target.value)}>
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
            {[
              { label: 'Avg Productivity Score', value: `${avgScore}%`, color: avgScore >= 70 ? '#10b981' : avgScore >= 40 ? '#f59e0b' : '#ef4444' },
              { label: 'Reports Submitted', value: reports.length, color: '#4f46e5' },
              { label: 'Tasks Completed', value: completedTasks, color: '#10b981' },
              { label: 'Days Present', value: presentDays, color: '#06b6d4' },
              { label: 'Total Hours Worked', value: `${totalHours}h`, color: '#8b5cf6' },
            ].map(item => (
              <div className="col-6 col-lg" key={item.label}>
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header-custom"><div className="card-title">Productivity Trend</div></div>
                <div style={{ padding: '16px 8px' }}>
                  {chartData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No report data for this period</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                        <Line type="monotone" dataKey="Score" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card">
                <div className="card-header-custom"><div className="card-title">Score Breakdown</div></div>
                <div style={{ padding: 20 }}>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 56, fontWeight: 900, color: avgScore >= 70 ? '#10b981' : avgScore >= 40 ? '#f59e0b' : '#ef4444', lineHeight: 1 }}>
                      {avgScore}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>out of 100</div>
                  </div>
                  <ProgressBar value={avgScore} color={avgScore >= 70 ? '#10b981' : avgScore >= 40 ? '#f59e0b' : '#ef4444'} showLabel={false} />
                  <div style={{ marginTop: 16, fontSize: 13, textAlign: 'center', color: '#64748b' }}>
                    {avgScore >= 70 ? '🌟 Excellent performance!' : avgScore >= 40 ? '👍 Good, keep improving!' : '💪 Needs improvement'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MyProductivity
