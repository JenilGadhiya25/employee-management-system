import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getAllReports } from '../../services/reportService'
import Avatar from '../../components/Avatar'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import ProgressBar from '../../components/ProgressBar'
import useTitle from '../../hooks/useTitle'

const Reports = () => {
  useTitle('Daily Reports')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = date ? { date } : {}
      const { data } = await getAllReports(params)
      setReports(data.data)
    } catch { toast.error('Failed to load reports') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [date])

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-header-title">Daily Reports</div>
          <div className="page-header-subtitle">View employee daily work reports</div>
        </div>
        <input type="date" className="form-control-custom" style={{ width: 180 }} value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {loading ? <Spinner /> : reports.length === 0 ? (
        <div className="card"><EmptyState icon="📋" title="No reports found" text="No daily reports submitted for the selected date" /></div>
      ) : (
        <div className="row g-3">
          {reports.map(r => (
            <div className="col-lg-6" key={r._id}>
              <div className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={r.employeeId?.name || 'U'} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{r.employeeId?.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.employeeId?.department} · {new Date(r.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: r.productivityScore >= 70 ? '#10b981' : r.productivityScore >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {r.productivityScore}%
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Productivity</div>
                    </div>
                  </div>
                  <ProgressBar value={r.productivityScore} showLabel={false}
                    color={r.productivityScore >= 70 ? '#10b981' : r.productivityScore >= 40 ? '#f59e0b' : '#ef4444'} />

                  {expanded === r._id && (
                    <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>✅ Completed Work</div>
                        <div style={{ fontSize: 13, color: '#334155', background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>{r.completedWork}</div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>⏳ Pending Work</div>
                        <div style={{ fontSize: 13, color: '#334155', background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>{r.pendingWork}</div>
                      </div>
                      {r.issues && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>⚠️ Issues</div>
                          <div style={{ fontSize: 13, color: '#334155', background: '#fef9c3', padding: '8px 12px', borderRadius: 8 }}>{r.issues}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reports
