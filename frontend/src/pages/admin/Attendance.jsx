import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiSearch, FiFilter } from 'react-icons/fi'
import { getAllAttendance } from '../../services/attendanceService'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import useTitle from '../../hooks/useTitle'

const AttendanceAdmin = () => {
  useTitle('Attendance')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ date: '', status: '' })

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.date) params.date = filters.date
      if (filters.status) params.status = filters.status
      const { data } = await getAllAttendance(params)
      setRecords(data.data)
    } catch { toast.error('Failed to load attendance') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filters])

  const fmt = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-header-title">Attendance Monitoring</div>
          <div className="page-header-subtitle">Track employee attendance records</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header-custom" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input type="date" className="form-control-custom" style={{ width: 160 }}
              value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} />
            <select className="form-control-custom" style={{ width: 140 }}
              value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="half-day">Half Day</option>
            </select>
            <button className="btn-outline-custom" onClick={() => setFilters({ date: '', status: '' })} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
              <FiFilter style={{fontSize:14}} /><span>Clear</span>
            </button>
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{records.length} records</span>
        </div>

        {loading ? <Spinner /> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="🕐" title="No attendance records" /></td></tr>
                ) : records.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={r.employeeId?.name || 'U'} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.employeeId?.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.employeeId?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{new Date(r.date).toLocaleDateString()}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{fmt(r.punchIn)}</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{fmt(r.punchOut)}</td>
                    <td><strong>{r.totalHours ? `${r.totalHours}h` : '—'}</strong></td>
                    <td><Badge value={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceAdmin
