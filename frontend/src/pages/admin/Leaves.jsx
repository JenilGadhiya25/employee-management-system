import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiCheck, FiX } from 'react-icons/fi'
import { getLeaves, approveLeave, rejectLeave } from '../../services/leaveService'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import useTitle from '../../hooks/useTitle'

const Leaves = () => {
  useTitle('Leave Approvals')
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('pending')

  const load = async () => {
    setLoading(true)
    try {
      const params = filterStatus ? { status: filterStatus } : {}
      const { data } = await getLeaves(params)
      setLeaves(data.data)
    } catch { toast.error('Failed to load leaves') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  const handleApprove = async (id) => {
    try { await approveLeave(id); toast.success('Leave approved'); load() }
    catch { toast.error('Failed to approve') }
  }

  const handleReject = async (id) => {
    try { await rejectLeave(id); toast.success('Leave rejected'); load() }
    catch { toast.error('Failed to reject') }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-header-title">Leave Approvals</div>
          <div className="page-header-subtitle">Review and manage employee leave requests</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <div style={{ display: 'flex', gap: 8 }}>
            {['', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={filterStatus === s ? 'btn-primary-custom' : 'btn-outline-custom'}
                style={{ padding: '6px 14px', fontSize: 12 }}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{leaves.length} requests</span>
        </div>

        {loading ? <Spinner /> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Employee</th><th>Leave Date</th><th>Reason</th><th>Applied On</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="📅" title="No leave requests" /></td></tr>
                ) : leaves.map(l => (
                  <tr key={l._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={l.employeeId?.name || 'U'} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{l.employeeId?.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{l.employeeId?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{new Date(l.leaveDate).toLocaleDateString()}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }}>{l.reason}</td>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td><Badge value={l.status} /></td>
                    <td>
                      {l.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-success-custom" style={{ padding:'6px 14px', display:'inline-flex', alignItems:'center', gap:5, fontSize:12 }} onClick={() => handleApprove(l._id)}>
                            <FiCheck style={{fontSize:13}} /><span>Approve</span>
                          </button>
                          <button className="btn-danger-custom" style={{ padding:'6px 14px', display:'inline-flex', alignItems:'center', gap:5, fontSize:12 }} onClick={() => handleReject(l._id)}>
                            <FiX style={{fontSize:13}} /><span>Reject</span>
                          </button>
                        </div>
                      )}
                      {l.status !== 'pending' && <span style={{ fontSize: 12, color: '#94a3b8' }}>Processed</span>}
                    </td>
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

export default Leaves
