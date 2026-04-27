import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiSend } from 'react-icons/fi'
import { submitDailyReport, getReportsByEmployee } from '../../services/reportService'
import { useAuth } from '../../context/AuthContext'
import ProgressBar from '../../components/ProgressBar'
import Spinner from '../../components/Spinner'
import useTitle from '../../hooks/useTitle'

const DailyReport = () => {
  useTitle('Daily Report')
  const { user } = useAuth()
  const [form, setForm] = useState({ completedWork: '', pendingWork: '', issues: '' })
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const load = async () => {
    try {
      const now = new Date()
      const { data } = await getReportsByEmployee(user._id, { month: now.getMonth() + 1, year: now.getFullYear() })
      setReports(data.data)
    } catch { toast.error('Failed to load reports') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user._id])

  const validate = () => {
    const e = {}
    if (!form.completedWork.trim()) e.completedWork = 'Required'
    if (!form.pendingWork.trim()) e.pendingWork = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitDailyReport(form)
      toast.success('Daily report submitted successfully!')
      setForm({ completedWork: '', pendingWork: '', issues: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report')
    } finally { setSubmitting(false) }
  }

  const todaySubmitted = reports.some(r => new Date(r.date).toDateString() === new Date().toDateString())

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-title">Daily Report</div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header-custom">
              <div>
                <div className="card-title">Submit Today's Report</div>
                <div className="card-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              {todaySubmitted && <span className="badge-custom badge-success">Submitted ✓</span>}
            </div>
            <div style={{ padding: 20 }}>
              {todaySubmitted ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ fontSize: 48 }}>✅</div>
                  <div style={{ fontWeight: 700, marginTop: 12, fontSize: 15 }}>Report submitted for today!</div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>You can submit again tomorrow.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label-custom">✅ Completed Work</label>
                    <textarea className="form-control-custom" rows={4} placeholder="Describe what you completed today..."
                      value={form.completedWork} onChange={e => setForm({ ...form, completedWork: e.target.value })} />
                    {errors.completedWork && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{errors.completedWork}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">⏳ Pending Work</label>
                    <textarea className="form-control-custom" rows={3} placeholder="What's still pending or carried forward..."
                      value={form.pendingWork} onChange={e => setForm({ ...form, pendingWork: e.target.value })} />
                    {errors.pendingWork && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{errors.pendingWork}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label-custom">⚠️ Issues / Blockers (optional)</label>
                    <textarea className="form-control-custom" rows={2} placeholder="Any blockers or issues faced..."
                      value={form.issues} onChange={e => setForm({ ...form, issues: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary-custom" disabled={submitting} style={{ width: '100%', justifyContent: 'center', display:'inline-flex', alignItems:'center', gap:7 }}>
                    <FiSend style={{fontSize:14, flexShrink:0}} />
                    <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-header-custom"><div className="card-title">Past Reports</div></div>
            {loading ? <Spinner /> : reports.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No reports submitted yet</div>
            ) : (
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {reports.map(r => (
                  <div key={r._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div style={{ fontWeight: 700, color: r.productivityScore >= 70 ? '#10b981' : r.productivityScore >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {r.productivityScore}%
                      </div>
                    </div>
                    <ProgressBar value={r.productivityScore} showLabel={false}
                      color={r.productivityScore >= 70 ? '#10b981' : r.productivityScore >= 40 ? '#f59e0b' : '#ef4444'} />
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.completedWork}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyReport
