import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiSend } from 'react-icons/fi'
import { applyLeave, getMyLeaves } from '../../services/leaveService'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import useTitle from '../../hooks/useTitle'

const ApplyLeave = () => {
  useTitle('Apply Leave')
  const { user } = useAuth()
  const [form, setForm] = useState({ leaveDate: '', reason: '' })
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const load = async () => {
    try {
      const { data } = await getMyLeaves(user._id)
      setLeaves(data.data)
    } catch {
      toast.error('Failed to load leave history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user._id])

  const validate = () => {
    const e = {}
    if (!form.leaveDate) {
      e.leaveDate = 'Please select a date'
    } else {
      const selected = new Date(form.leaveDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selected < today) e.leaveDate = 'Cannot apply for past dates'
    }
    if (!form.reason.trim()) e.reason = 'Reason is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await applyLeave(form)
      toast.success('Leave application submitted!')
      setForm({ leaveDate: '', reason: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for leave')
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-title">Apply for Leave</div>
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header-custom">
              <div className="card-title">New Leave Request</div>
            </div>
            <div style={{ padding: 20 }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label-custom">Leave Date</label>
                  <input
                    type="date"
                    className="form-control-custom"
                    min={today}
                    value={form.leaveDate}
                    onChange={e => setForm({ ...form, leaveDate: e.target.value })}
                  />
                  {errors.leaveDate && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{errors.leaveDate}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label-custom">Reason for Leave</label>
                  <textarea
                    className="form-control-custom"
                    rows={4}
                    placeholder="Please provide a reason for your leave request..."
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                  />
                  {errors.reason && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{errors.reason}</div>
                  )}
                </div>
                <button type="submit" className="btn-primary-custom" disabled={submitting} style={{ width: '100%', justifyContent: 'center', display:'inline-flex', alignItems:'center', gap:7 }}>
                  <FiSend style={{fontSize:14, flexShrink:0}} />
                  <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card">
            <div className="card-header-custom">
              <div className="card-title">My Leave History</div>
              <span style={{ fontSize: 13, color: '#64748b' }}>{leaves.length} requests</span>
            </div>
            {loading ? (
              <Spinner />
            ) : leaves.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                No leave requests yet
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Leave Date</th>
                      <th>Reason</th>
                      <th>Applied On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l._id}>
                        <td style={{ fontWeight: 600 }}>
                          {new Date(l.leaveDate).toLocaleDateString()}
                        </td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }}>
                          {l.reason}
                        </td>
                        <td style={{ fontSize: 12, color: '#94a3b8' }}>
                          {new Date(l.createdAt).toLocaleDateString()}
                        </td>
                        <td><Badge value={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplyLeave
