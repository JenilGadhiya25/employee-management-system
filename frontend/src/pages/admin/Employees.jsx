import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../services/employeeService'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import useTitle from '../../hooks/useTitle'

const blank = { name: '', email: '', password: '', role: 'employee', department: '', designation: '' }

const Employees = () => {
  useTitle('Employees')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const load = async () => {
    try {
      const { data } = await getEmployees({ search })
      setEmployees(data.data)
    } catch { toast.error('Failed to load employees') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email) e.email = 'Required'
    if (!editing && !form.password) e.password = 'Required'
    if (!form.department.trim()) e.department = 'Required'
    if (!form.designation.trim()) e.designation = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const openCreate = () => { setEditing(null); setForm(blank); setErrors({}); setShowModal(true) }
  const openEdit = (emp) => { setEditing(emp); setForm({ ...emp, password: '' }); setErrors({}); setShowModal(true) }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editing) {
        await updateEmployee(editing._id, form)
        toast.success('Employee updated')
      } else {
        await createEmployee(form)
        toast.success('Employee created')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return
    try {
      await deleteEmployee(id)
      toast.success('Employee deactivated')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const f = (key, label, type = 'text') => (
    <div className="form-group">
      <label className="form-label-custom">{label}</label>
      <input type={type} className="form-control-custom" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
      {errors[key] && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{errors[key]}</div>}
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-header-title">Employee Management</div>
          <div className="page-header-subtitle">Manage all employees in your organization</div>
        </div>
        <button className="btn-primary-custom" onClick={openCreate} style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
          <FiPlus style={{ fontSize:15, flexShrink:0 }} /><span>Add Employee</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{employees.length} employees</span>
        </div>

        {loading ? <Spinner /> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="👥" title="No employees found" /></td></tr>
                ) : employees.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td><Badge value={emp.role} /></td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(emp.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-outline-custom" style={{ padding:'6px 10px', display:'inline-flex', alignItems:'center', gap:5 }} onClick={() => openEdit(emp)}><FiEdit2 style={{fontSize:14}} /></button>
                        <button className="btn-danger-custom" style={{ padding:'6px 10px', display:'inline-flex', alignItems:'center', gap:5 }} onClick={() => handleDelete(emp._id)}><FiTrash2 style={{fontSize:14}} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Employee' : 'Add Employee'}
        footer={<>
          <button className="btn-outline-custom" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn-primary-custom" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </>}>
        <div className="row g-2">
          <div className="col-12">{f('name', 'Full Name')}</div>
          <div className="col-12">{f('email', 'Email', 'email')}</div>
          {!editing && <div className="col-12">{f('password', 'Password', 'password')}</div>}
          <div className="col-6">{f('department', 'Department')}</div>
          <div className="col-6">{f('designation', 'Designation')}</div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label-custom">Role</label>
              <select className="form-control-custom" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Employees
