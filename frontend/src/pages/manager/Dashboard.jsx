import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import dashboardService from '../../services/dashboardService'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const now = new Date()

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1)
  const [calendarYear, setCalendarYear] = useState(now.getFullYear())

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [s, a, t] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getMonthlyAttendance(month, year),
        dashboardService.getTaskSummary(),
      ])
      setStats(s.data.data)
      setAttendance(a.data.data || [])
      setTasks(t.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const id = setInterval(() => load(true), 30000)
    return () => clearInterval(id)
  }, [load])

  // Chart data
  const chartData = attendance.slice(0, 12).map((e, i) => ({
    name: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    value: e.presentDays || 0,
  }))

  // Calendar
  const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay()
  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate()
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const prevMonth = () => {
    if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(y => y - 1) }
    else setCalendarMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(y => y + 1) }
    else setCalendarMonth(m => m + 1)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 600 }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div style={{ maxWidth: 1400, padding: '0 20px' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0 }}>Team Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            width: 40, height: 40, borderRadius: 10, background: 'white',
            border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#64748B'
          }}>
            🔔
          </button>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#2563EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer'
          }}>
            {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Team Members', value: attendance.length || 0, trend: '+18%' },
          { label: 'Present Today', value: attendance.filter(e => e.presentDays > 0).length || 0, trend: '+11%' },
          { label: 'Total Tasks', value: stats?.totalTasks || 0, trend: '+8%' },
        ].map((item, idx) => (
          <div key={idx} style={{
            background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 6 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>
                  {item.value}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#2563EB', fontWeight: 700 }}>
                {item.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* LEFT: Charts */}
        <div>
          {/* Team Performance Chart */}
          <div style={{
            background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Team Performance
                </h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                  Monthly attendance
                </p>
              </div>
              <button style={{
                padding: '6px 12px', background: '#2563EB', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer'
              }}>
                Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 8, color: 'white' }} />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Team Members Table */}
          <div style={{
            background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Team Members
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button style={{
                padding: '8px 16px', background: '#2563EB', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer'
              }}>
                Status
              </button>
              <button style={{
                padding: '8px 16px', background: 'white', color: '#64748B',
                border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer'
              }}>
                Department
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 4).map((emp, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '14px 0', fontSize: 13, color: '#0F172A', fontWeight: 500 }}>
                      {emp.name}
                    </td>
                    <td style={{ padding: '14px 0', fontSize: 13, color: '#2563EB', fontWeight: 600 }}>
                      Present
                    </td>
                    <td style={{ padding: '14px 0', fontSize: 13, color: '#64748B' }}>
                      {emp.totalHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Calendar & Stats */}
        <div>
          {/* Calendar */}
          <div style={{
            background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Select date
              </h4>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={prevMonth} style={{
                  width: 24, height: 24, border: '1px solid #E2E8F0', background: 'white',
                  borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#64748B', fontSize: 12
                }}>
                  ‹
                </button>
                <button onClick={nextMonth} style={{
                  width: 24, height: 24, border: '1px solid #E2E8F0', background: 'white',
                  borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#64748B', fontSize: 12
                }}>
                  ›
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94A3B8', padding: '6px 0' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {calendarDays.map((day, idx) => (
                <div key={idx} style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, borderRadius: 6,
                  background: day === now.getDate() && calendarMonth === now.getMonth() + 1 ? '#2563EB' : '#F8FAFC',
                  color: day === now.getDate() && calendarMonth === now.getMonth() + 1 ? 'white' : '#0F172A',
                  cursor: day ? 'pointer' : 'default'
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Team Stats */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0' }}>
                Team Stats
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Team Size', value: `${attendance.length} members` },
                  { label: 'Tasks Done', value: `${stats?.completedTasks || 0}/${stats?.totalTasks || 0}`, highlight: true },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: 12, background: item.highlight ? '#2563EB' : '#F8FAFC',
                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: item.highlight ? 'white' : '#0F172A' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.highlight ? 'white' : '#0F172A' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
