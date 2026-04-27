import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { getTasks, createTask, updateTask, deleteTask } from '../../services/taskService'
import { getEmployees } from '../../services/employeeService'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import useTitle from '../../hooks/useTitle'

const blank = { title: '', description: '', priority: 'medium', assignedTo: '', deadline: '' }

const Tasks = () => {
  useTitle('Tasks')
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [errors, setErrors] = useState({})

  const load = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {}
      const [t, e] = await Promise.all([getTasks(params), getEmployees()])
      setTasks(t.data.data)
      setEmployees(e.data.data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (!form.assignedTo) e.assignedTo = 'Required'
    if (!form.deadline) e.deadline = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const openCreate = () => { setEditing(null); setForm(blank); setErrors({}); setShowModal(true) }
  const openEdit = (t) => {
    setEditing(t)
    setForm({ title: t.title, description: t.description, priority: t.priority, assignedTo: t.assignedTo?._id || '', deadline: t.deadline?.slice(0, 10) || '' })
    setErrors({})
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editing) { await updateTask(editing._id, form); toast.success('Task updated') }
      else { await createTask(form); toast.success('Task created & employee notified') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try { await deleteTask(id); toast.success('Task deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-header-title">Task Management</div>
          <div className="page-header-subtitle">Assign and track tasks across your team</div>
        </div>
        <button className="btn-primary-custom" onClick={openCreate} style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
          <FiPlus style={{ fontSize:15, flexShrink:0 }} /><span>Assign Task</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <div style={{ display: 'flex', gap: 10 }}>
            {['', 'pending', 'in-progress', 'completed', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={filterStatus === s ? 'btn-primary-custom' : 'btn-outline-custom'}
                style={{ padding: '6px 14px', fontSize: 12 }}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{tasks.length} tasks</span>
        </div>

        {loading ? <Spinner /> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="✅" title="No tasks found" /></td></tr>
                ) : tasks.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={t.assignedTo?.name || 'U'} size="sm" />
                        <span style={{ fontSize: 13 }}>{t.assignedTo?.name}</span>
                      </div>
                    </td>
                    <td><Badge value={t.priority} /></td>
                    <td style={{ fontSize: 12, color: new Date(t.deadline) < new Date() && t.status !== 'completed' ? '#ef4444' : '#64748b' }}>
                      {new Date(t.deadline).toLocaleDateString()}
                    </td>
                    <td><Badge value={t.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-outline-custom" style={{ padding:'6px 10px', display:'inline-flex', alignItems:'center' }} onClick={() => openEdit(t)}><FiEdit2 style={{fontSize:14}} /></button>
                        <button className="btn-danger-custom" style={{ padding:'6px 10px', display:'inline-flex', alignItems:'center' }} onClick={() => handleDelete(t._id)}><FiTrash2 style={{fontSize:14}} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Task' : 'Assign New Task'}
        footer={<>
          <button className="btn-outline-custom" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn-primary-custom" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Assign'}</button>
        </>}>
        <div className="row g-2">
          <div className="col-12">
            <div className="form-group">
              <label className="form-label-custom">Task Title</label>
              <input className="form-control-custom" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              {errors.title && <div style={{ color: '#ef4444', fontSize: 12 }}>{errors.title}</div>}
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label-custom">Description</label>
              <textarea className="form-control-custom" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              {errors.description && <div style={{ color: '#ef4444', fontSize: 12 }}>{errors.description}</div>}
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label className="form-label-custom">Assign To</label>
              <select className="form-control-custom" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
              {errors.assignedTo && <div style={{ color: '#ef4444', fontSize: 12 }}>{errors.assignedTo}</div>}
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label className="form-label-custom">Priority</label>
              <select className="form-control-custom" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label-custom">Deadline</label>
              <input type="date" className="form-control-custom" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              {errors.deadline && <div style={{ color: '#ef4444', fontSize: 12 }}>{errors.deadline}</div>}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Tasks
