import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getTasksByEmployee, updateTaskStatus } from '../../services/taskService'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import useTitle from '../../hooks/useTitle'

const MyTasks = () => {
  useTitle('My Tasks')
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    try {
      const { data } = await getTasksByEmployee(user._id)
      setTasks(data.data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user._id])

  const openUpdate = (task) => { setSelected(task); setNewStatus(task.status) }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await updateTaskStatus(selected._id, newStatus)
      toast.success('Task status updated')
      setSelected(null)
      load()
    } catch { toast.error('Failed to update') }
    finally { setUpdating(false) }
  }

  const filtered = filter ? tasks.filter(t => t.status === filter) : tasks

  const priorityColor = { low: '#94a3b8', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-title">My Tasks</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'pending', 'in-progress', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={filter === s ? 'btn-primary-custom' : 'btn-outline-custom'}
            style={{ padding: '6px 14px', fontSize: 12 }}>
            {s || 'All'} {s === '' ? `(${tasks.length})` : `(${tasks.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="✅" title="No tasks found" /></div>
      ) : (
        <div className="row g-3">
          {filtered.map(t => (
            <div className="col-lg-6" key={t._id}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{t.description}</div>
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: priorityColor[t.priority], flexShrink: 0, marginTop: 4, marginLeft: 8 }} title={t.priority} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <Badge value={t.status} />
                  <Badge value={t.priority} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Deadline: <strong style={{ color: new Date(t.deadline) < new Date() && t.status !== 'completed' ? '#ef4444' : '#334155' }}>
                      {new Date(t.deadline).toLocaleDateString()}
                    </strong>
                  </div>
                  {t.status !== 'completed' && t.status !== 'cancelled' && (
                    <button className="btn-primary-custom" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => openUpdate(t)}>
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={!!selected} onClose={() => setSelected(null)} title="Update Task Status"
        footer={<>
          <button className="btn-outline-custom" onClick={() => setSelected(null)}>Cancel</button>
          <button className="btn-primary-custom" onClick={handleUpdate} disabled={updating}>{updating ? 'Updating...' : 'Update'}</button>
        </>}>
        {selected && (
          <>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700 }}>{selected.title}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{selected.description}</div>
            </div>
            <div className="form-group">
              <label className="form-label-custom">New Status</label>
              <select className="form-control-custom" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default MyTasks
