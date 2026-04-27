import { useState, useEffect } from 'react'
import { FiCalendar, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import dashboardService from '../../services/dashboardService'

const ManagerAttendance = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getMonthlyAttendance()
        setAttendance(res.data.data || [])
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
      <p style={{ color:'#94a3b8', fontSize:13 }}>Loading attendance…</p>
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Team Attendance</h1>
          <p className="page-header-subtitle">Monitor your team's attendance records</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <div className="card-title">Attendance Records</div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Present Days</th>
                <th>Absent Days</th>
                <th>Leave Days</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((emp, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td><span className="badge-success">{emp.presentDays}</span></td>
                  <td><span className="badge-danger">{emp.absentDays}</span></td>
                  <td><span className="badge-warning">{emp.leaveDays}</span></td>
                  <td><strong>{emp.totalHours}h</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManagerAttendance
