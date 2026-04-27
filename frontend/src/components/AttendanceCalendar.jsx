import { useState, useEffect, useCallback } from 'react'
import { FiChevronLeft, FiChevronRight, FiClock, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import dashboardService from '../services/dashboardService'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

/* status config */
const STATUS = {
  full:    { bg: '#dcfce7', border: '#86efac', text: '#15803d', dot: '#10b981', label: '🟢 Full Day'  },
  partial: { bg: '#fef9c3', border: '#fde047', text: '#a16207', dot: '#f59e0b', label: '🟡 Partial'   },
  absent:  { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', dot: '#ef4444', label: '🔴 Absent'    },
  leave:   { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1', dot: '#0ea5e9', label: '🔵 Leave'     },
  sunday:  { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', dot: '#cbd5e1', label: '⚪ Sunday'    },
  future:  { bg: '#f8fafc', border: '#e2e8f0', text: '#cbd5e1', dot: '#e2e8f0', label: '⚪ Upcoming'  },
}

const fmt = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ── Tooltip ── */
const DayTooltip = ({ day, empName }) => {
  const s = STATUS[day.status] || STATUS.absent
  return (
    <div style={{
      position: 'absolute', zIndex: 50, bottom: 'calc(100% + 12px)', left: '50%',
      transform: 'translateX(-50%)', background: '#0f172a', color: 'white',
      borderRadius: 12, padding: '12px 16px', fontSize: 12, whiteSpace: 'nowrap',
      boxShadow: '0 12px 32px rgba(0,0,0,0.3)', pointerEvents: 'none',
      minWidth: 180,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: s.dot, fontSize: 13 }}>
        {s.label} — Day {day.day}
      </div>
      {day.status !== 'sunday' && day.status !== 'future' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
            <span style={{ color: '#94a3b8' }}>Clock In</span>
            <span style={{ fontWeight: 600 }}>{fmt(day.punchIn)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
            <span style={{ color: '#94a3b8' }}>Clock Out</span>
            <span style={{ fontWeight: 600 }}>{fmt(day.punchOut)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#94a3b8' }}>Total Hours</span>
            <span style={{ fontWeight: 700, color: s.dot }}>{day.totalHours}h</span>
          </div>
        </>
      )}
      {/* arrow */}
      <div style={{
        position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
        width: 12, height: 12, background: '#0f172a', rotate: '45deg',
      }} />
    </div>
  )
}

/* ── Single employee calendar ── */
const EmployeeCalendar = ({ empData, month, year, isMe }) => {
  const [hovered, setHovered] = useState(null)
  const { days, leaveQuota, name, department } = empData

  // first day of month weekday offset
  const firstDay = new Date(year, month - 1, 1).getDay()
  const q = leaveQuota

  return (
    <div className="card" style={{ overflow: 'visible' }}>
      {/* header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.01em' }}>
            {isMe ? 'My Attendance Calendar' : name}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{department}</div>
        </div>

        {/* leave quota badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10,
            padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#15803d',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <FiCheckCircle size={13} />
            {q.freeLeft} free
          </div>
          <div style={{
            background: q.isPaid ? '#fef2f2' : '#f8fafc',
            border: `1px solid ${q.isPaid ? '#fca5a5' : '#e2e8f0'}`,
            borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700,
            color: q.isPaid ? '#b91c1c' : '#94a3b8',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {q.isPaid ? <FiAlertTriangle size={13} /> : <FiInfo size={13} />}
            {q.used}/{q.total} used
          </div>
        </div>
      </div>

      {/* paid leave warning banner */}
      {q.isPaid && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
          borderBottom: '1px solid #fecaca',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, color: '#b91c1c', fontWeight: 600,
        }}>
          <FiAlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>{q.paidLeaves} paid leave{q.paidLeaves > 1 ? 's' : ''} this month — salary deduction applies</span>
        </div>
      )}

      <div style={{ padding: '24px' }}>
        {/* day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 11, fontWeight: 800,
              color: d === 'Sun' ? '#ef4444' : '#64748b',
              padding: '8px 0', letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>{d}</div>
          ))}
        </div>

        {/* calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {/* empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map(day => {
            const s = STATUS[day.status] || STATUS.absent
            const isToday = new Date(day.date).toDateString() === new Date().toDateString()

            return (
              <div
                key={day.day}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHovered(day.day)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{
                  background: s.bg,
                  border: `2px solid ${isToday ? '#6366f1' : s.border}`,
                  borderRadius: 12,
                  padding: '8px 6px',
                  textAlign: 'center',
                  cursor: day.status === 'future' || day.status === 'sunday' ? 'default' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: isToday ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                  transform: hovered === day.day && day.status !== 'future' && day.status !== 'sunday' ? 'translateY(-4px)' : 'translateY(0)',
                  minHeight: 56,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                  <span style={{
                    fontSize: 13, fontWeight: isToday ? 800 : 700,
                    color: isToday ? '#6366f1' : s.text,
                    lineHeight: 1,
                  }}>{day.day}</span>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: isToday ? '#6366f1' : s.dot,
                    boxShadow: isToday ? '0 0 0 2px rgba(99,102,241,0.2)' : 'none',
                  }} />
                  {(day.status === 'full' || day.status === 'partial') && (
                    <span style={{ fontSize: 9, color: s.text, fontWeight: 800, lineHeight: 1 }}>
                      {day.totalHours}h
                    </span>
                  )}
                </div>

                {/* tooltip */}
                {hovered === day.day && day.status !== 'future' && day.status !== 'sunday' && (
                  <DayTooltip day={day} empName={name} />
                )}
              </div>
            )
          })}
        </div>

        {/* legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
          {Object.entries(STATUS).filter(([k]) => !['sunday','future'].includes(k)).map(([key, s]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 4, background: s.bg, border: `2px solid ${s.border}`, flexShrink: 0 }} />
              <span style={{ color: '#64748b', fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: '#f8fafc', border: '2px solid #6366f1', flexShrink: 0 }} />
            <span style={{ color: '#64748b', fontWeight: 500 }}>Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main exported component ── */
const AttendanceCalendar = ({ userId, userRole }) => {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [data,  setData]  = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmp, setSelectedEmp] = useState(null) // for admin multi-emp view

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await dashboardService.getCalendarData(month, year)
      setData(res.data.data || [])
      if (!selectedEmp && res.data.data?.length > 0) {
        setSelectedEmp(String(res.data.data[0].employeeId))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    const n = new Date(); n.setHours(0,0,0,0)
    const target = new Date(year, month, 1)
    if (target > n) return
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isEmployee = userRole === 'employee'
  const displayData = isEmployee ? data : (data.filter(d => String(d.employeeId) === selectedEmp))
  const canGoNext = new Date(year, month, 1) <= new Date()

  return (
    <div>
      {/* month nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={prevMonth} style={{
            width: 38, height: 38, borderRadius: 11, border: '1.5px solid #e2e8f0',
            background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', transition: 'all 0.2s', fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
          >
            <FiChevronLeft size={18} />
          </button>

          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a', minWidth: 180, textAlign: 'center', letterSpacing: '-0.01em' }}>
            {MONTHS[month - 1]} {year}
          </h3>

          <button onClick={nextMonth} disabled={!canGoNext} style={{
            width: 38, height: 38, borderRadius: 11, border: '1.5px solid #e2e8f0',
            background: 'white', cursor: canGoNext ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: canGoNext ? '#64748b' : '#e2e8f0', transition: 'all 0.2s',
            opacity: canGoNext ? 1 : 0.5, fontFamily: 'inherit',
          }}>
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* employee selector for admin/manager */}
        {!isEmployee && data.length > 1 && (
          <select
            value={selectedEmp || ''}
            onChange={e => setSelectedEmp(e.target.value)}
            style={{
              padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: 11,
              fontSize: 13, color: '#0f172a', background: 'white', cursor: 'pointer',
              fontFamily: 'inherit', outline: 'none', minWidth: 220, fontWeight: 500,
            }}
          >
            {data.map(d => (
              <option key={String(d.employeeId)} value={String(d.employeeId)}>
                {d.name} — {d.department}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : displayData.length > 0 ? (
        displayData.map(emp => (
          <EmployeeCalendar
            key={String(emp.employeeId)}
            empData={emp}
            month={month}
            year={year}
            isMe={isEmployee}
          />
        ))
      ) : (
        <div className="card" style={{ padding: 50, textAlign: 'center', color: '#94a3b8' }}>
          <FiClock size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>No attendance data for this period</div>
        </div>
      )}
    </div>
  )
}

export default AttendanceCalendar
