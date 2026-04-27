import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import { FiLogIn, FiLogOut, FiCoffee, FiPlay, FiCheckCircle, FiAlertCircle, FiEdit3, FiPower } from 'react-icons/fi'
import { clockIn, lunchBreak, clockOut, endDay, getTodayRecord, getAttendanceByEmployee } from '../../services/attendanceService'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import useTitle from '../../hooks/useTitle'

// ─── Constants ────────────────────────────────────────────────────────────────
const LUNCH_HOUR   = 12
const LUNCH_MINUTE = 30
const EOD_HOUR     = 18   // 6:30 PM end-of-day
const EOD_MINUTE   = 30

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

/*
  STATE MACHINE:
  'idle'    → no record today           → show: [Clock In]
  'working' → clocked in, not on break  → show: [Lunch Break] [Clock Out] [End Day*]
  'onBreak' → on break (lunch/out)      → show: [Clock In / Resume]
  'done'    → dayEnded = true           → show: completion screen
  
  * End Day = final clock-out, requires 9h, cannot clock in after
  * Clock Out = temporary, can clock back in
*/
const deriveState = (rec) => {
  if (!rec) return 'idle'
  if (rec.dayEnded) return 'done'
  if (rec.sessions && rec.sessions.length > 0) {
    if (rec.onBreak) return 'onBreak'
    return 'working'
  }
  if (rec.punchIn && !rec.dayEnded) return 'working'
  return 'idle'
}

const calcLiveHours = (rec) => {
  if (!rec) return 0
  if (rec.sessions && rec.sessions.length > 0) {
    let ms = 0
    for (const s of rec.sessions) {
      const start = new Date(s.clockIn)
      const end   = s.clockOut ? new Date(s.clockOut) : new Date()
      ms += Math.max(0, end - start)
    }
    return parseFloat((ms / 3_600_000).toFixed(3))
  }
  if (rec.punchIn) {
    const end = rec.punchOut ? new Date(rec.punchOut) : new Date()
    return parseFloat(((end - new Date(rec.punchIn)) / 3_600_000).toFixed(3))
  }
  return 0
}

// ─── Reusable Reason Modal ────────────────────────────────────────────────────
const ReasonModal = ({ show, onClose, onConfirm, title, subtitle, placeholder, confirmLabel, confirmClass, loading, iconEl, warning }) => {
  const [reason, setReason] = useState('')
  const [error, setError]   = useState('')
  useEffect(() => { if (show) { setReason(''); setError('') } }, [show])

  const handleConfirm = () => {
    if (!reason.trim()) { setError('Please write a reason before continuing'); return }
    onConfirm(reason)
  }

  return (
    <Modal show={show} onClose={onClose} title={title}
      footer={<>
        <button className="btn-outline-custom" onClick={onClose}>Cancel</button>
        <button className={confirmClass} onClick={handleConfirm} disabled={loading}>
          {iconEl}&nbsp;{loading ? 'Please wait...' : confirmLabel}
        </button>
      </>}
    >
      <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderRadius: 12, padding: '14px 18px', marginBottom: 18, border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 28 }}>{iconEl}</div>
        <div>
          <div style={{ fontWeight: 700, color: '#4c1d95', fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>

      {warning && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#a16207', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiAlertCircle /> {warning}
        </div>
      )}

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label-custom" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiEdit3 style={{ color: '#6366f1' }} /> Reason <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea className="form-control-custom" rows={4} placeholder={placeholder}
          value={reason} onChange={e => { setReason(e.target.value); setError('') }}
          style={{ resize: 'vertical', fontSize: 13.5 }} autoFocus />
        {error && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}><FiAlertCircle /> {error}</div>}
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>This reason will be saved with your attendance record.</div>
      </div>
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AttendanceEmployee = () => {
  useTitle('My Attendance')
  const { user } = useAuth()

  const [time, setTime]               = useState(new Date())
  const [todayRec, setTodayRec]       = useState(null)
  const [records, setRecords]         = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [actionLoading, setAction]    = useState(false)
  const [liveHours, setLiveHours]     = useState(0)
  const [modal, setModal]             = useState(null) // 'clockin'|'lunch'|'clockout'|'endday'

  const lunchNotifFired = useRef(false)
  const nineHourFired   = useRef(false)
  const actionRef       = useRef(false)
  const todayRecRef     = useRef(todayRec)
  useEffect(() => { todayRecRef.current = todayRec }, [todayRec])

  // ── Live clock + notifications ─────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date()
      setTime(now)
      const rec   = todayRecRef.current
      const state = deriveState(rec)
      const hours = calcLiveHours(rec)
      setLiveHours(hours)

      // 12:30 PM lunch reminder (only while working)
      if (
        now.getHours() === LUNCH_HOUR &&
        now.getMinutes() === LUNCH_MINUTE &&
        now.getSeconds() === 0 &&
        state === 'working' &&
        !lunchNotifFired.current
      ) {
        lunchNotifFired.current = true
        toast.info('🍽️ 12:30 PM — Lunch time! Take a break.', { autoClose: 10000, toastId: 'lunch' })
      }

      // 6:30 PM end-of-day reminder
      if (
        now.getHours() === EOD_HOUR &&
        now.getMinutes() === EOD_MINUTE &&
        now.getSeconds() === 0 &&
        (state === 'working' || state === 'onBreak') &&
        !nineHourFired.current
      ) {
        nineHourFired.current = true
        toast.success('🏠 6:30 PM — Time to go home! You can end your day now.', {
          autoClose: 12000,
          toastId: 'eod',
        })
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const now = new Date()
      const [todayRes, monthRes] = await Promise.all([
        getTodayRecord(),
        getAttendanceByEmployee(user._id, { month: now.getMonth() + 1, year: now.getFullYear() }),
      ])
      const rec = todayRes.data.data
      setTodayRec(rec)
      setLiveHours(calcLiveHours(rec))
      setRecords(monthRes.data.data)
    } catch { toast.error('Failed to load attendance') }
    finally { setPageLoading(false) }
  }, [user._id])

  useEffect(() => { load() }, [load])

  const uiState      = deriveState(todayRec)
  const firstClockIn = todayRec?.sessions?.[0]?.clockIn || todayRec?.punchIn

  // Calculate overtime: time worked after 6:30 PM
  const calcOvertime = (rec) => {
    if (!rec || !rec.sessions) return 0
    const cutoff = new Date()
    cutoff.setHours(EOD_HOUR, EOD_MINUTE, 0, 0)
    let ms = 0
    for (const s of rec.sessions) {
      if (s.clockIn && s.clockOut) {
        const end = new Date(s.clockOut)
        if (end > cutoff) {
          const start = new Date(s.clockIn) > cutoff ? new Date(s.clockIn) : cutoff
          ms += end - start
        }
      } else if (s.clockIn && !s.clockOut) {
        // Active session
        const now = new Date()
        if (now > cutoff) {
          const start = new Date(s.clockIn) > cutoff ? new Date(s.clockIn) : cutoff
          ms += now - start
        }
      }
    }
    return parseFloat((ms / 3_600_000).toFixed(2))
  }

  const overtime = calcOvertime(todayRec)

  // Progress toward 6:30 PM (from first clock-in)
  const eodToday = new Date()
  eodToday.setHours(EOD_HOUR, EOD_MINUTE, 0, 0)
  const progressPct = firstClockIn
    ? Math.min(((new Date() - new Date(firstClockIn)) / (eodToday - new Date(firstClockIn))) * 100, 100)
    : 0

  const steps = [
    { key: 'idle',    label: 'Not Started' },
    { key: 'working', label: 'Working' },
    { key: 'onBreak', label: 'Break' },
    { key: 'done',    label: 'Day Complete' },
  ]
  const stepIdx = steps.findIndex(s => s.key === uiState)

  // ── Action guard ───────────────────────────────────────────────────────────
  const withGuard = (fn) => async (reason) => {
    if (actionRef.current) return
    actionRef.current = true
    setAction(true)
    try { await fn(reason) }
    finally { setAction(false); actionRef.current = false }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const doClockIn = withGuard(async (reason) => {
    try {
      const { data } = await clockIn(reason)
      setTodayRec(data.data); setLiveHours(calcLiveHours(data.data)); setModal(null)
      toast.success(uiState === 'onBreak' ? '☀️ Resumed work!' : '🟢 Clocked in! Have a great day.')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to clock in') }
  })

  const doLunch = withGuard(async (reason) => {
    try {
      const { data } = await lunchBreak(reason)
      setTodayRec(data.data); setLiveHours(calcLiveHours(data.data)); setModal(null)
      toast.success('🍽️ Lunch break started!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  })

  const doClockOut = withGuard(async (reason) => {
    try {
      const { data } = await clockOut(reason)
      setTodayRec(data.data); setLiveHours(calcLiveHours(data.data)); setModal(null)
      toast.success('⏸️ Clocked out. Clock back in when ready.')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  })

  const doEndDay = withGuard(async (reason) => {
    try {
      const { data } = await endDay(reason)
      setTodayRec(data.data); setLiveHours(calcLiveHours(data.data)); setModal(null)
      toast.success(`✅ Day ended! Total: ${data.data.totalHours}h. Great work!`)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to end day') }
  })

  const openEndDay = () => {
    setModal('endday')
  }

  if (pageLoading) return <Spinner />

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-header-title">My Attendance</div>
          <div className="page-header-subtitle">{fmtDate(new Date())}</div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* ══ LEFT: Punch Card ══════════════════════════════════════════════ */}
        <div className="col-lg-5">
          <div className="punch-card">
            <div className="punch-time">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            <div className="punch-date">{fmtDate(new Date())}</div>

            {/* Step indicator */}
            <div className="step-indicator" style={{ marginTop: 18 }}>
              {steps.map((s, i) => (
                <span key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`step-dot${i < stepIdx ? ' done' : i === stepIdx ? ' active' : ''}`} title={s.label} />
                  {i < steps.length - 1 && <span className={`step-line${i < stepIdx ? ' done' : ''}`} />}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 6, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              {steps[stepIdx]?.label}
            </div>

            {/* ── Buttons ── */}
            <div className="punch-buttons-row">

              {/* IDLE → Clock In */}
              {uiState === 'idle' && (
                <button className="punch-btn" onClick={() => setModal('clockin')} disabled={actionLoading}>
                  <FiLogIn style={{ fontSize: 28 }} /><span>Clock In</span>
                </button>
              )}

              {/* WORKING → Lunch + Clock Out + End Day */}
              {uiState === 'working' && (
                <>
                  <button className="punch-btn btn-lunch" onClick={() => setModal('lunch')} disabled={actionLoading} title="Lunch Break">
                    <FiCoffee style={{ fontSize: 24 }} /><span>Lunch</span>
                  </button>
                  <button className="punch-btn btn-clockout" onClick={() => setModal('clockout')} disabled={actionLoading} title="Temporary Clock Out">
                    <FiLogOut style={{ fontSize: 24 }} /><span>Clock Out</span>
                  </button>
                  <button
                    className="punch-btn"
                    onClick={openEndDay}
                    disabled={actionLoading}
                    title="End Day"
                    style={{ borderColor: 'rgba(16,185,129,0.5)', background: 'rgba(16,185,129,0.2)' }}
                  >
                    <FiPower style={{ fontSize: 22 }} /><span>End Day</span>
                  </button>
                </>
              )}

              {/* ON BREAK → Resume (Clock In) */}
              {uiState === 'onBreak' && (
                <button className="punch-btn btn-resume" onClick={() => setModal('clockin')} disabled={actionLoading} title="Resume Work">
                  <FiPlay style={{ fontSize: 26 }} /><span>Resume</span>
                </button>
              )}

              {/* DONE */}
              {uiState === 'done' && (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <FiCheckCircle style={{ fontSize: 52, opacity: 0.9 }} />
                  <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, opacity: 0.95 }}>Day Complete!</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 5 }}>{todayRec?.totalHours}h worked today</div>
                </div>
              )}
            </div>

            {/* ── Progress Bar toward 6:30 PM ── */}
            {(uiState === 'working' || uiState === 'onBreak') && (
              <div style={{ marginBottom: 18, padding: '0 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.85, marginBottom: 7, fontWeight: 500 }}>
                  <span>Progress to 6:30 PM</span>
                  <span>{liveHours.toFixed(2)}h worked</span>
                </div>
                <div style={{ height: 7, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(progressPct, 100)}%`,
                    background: overtime > 0
                      ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                      : progressPct >= 100
                        ? 'linear-gradient(90deg,#10b981,#34d399)'
                        : 'rgba(255,255,255,0.85)',
                    borderRadius: 10,
                    transition: 'width 1s linear',
                  }} />
                </div>
                {overtime > 0 ? (
                  <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 5, textAlign: 'center', fontWeight: 700 }}>
                    ⏰ Overtime: +{overtime.toFixed(2)}h after 6:30 PM
                  </div>
                ) : progressPct >= 100 ? (
                  <div style={{ fontSize: 10, color: '#34d399', marginTop: 5, textAlign: 'center', fontWeight: 700 }}>
                    🏠 6:30 PM reached — you can end your day!
                  </div>
                ) : (
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 5, textAlign: 'center' }}>
                    End day anytime · Overtime counted after 6:30 PM
                  </div>
                )}
              </div>
            )}

            {/* ── Status Grid ── */}
            <div className="punch-status-grid">
              <div className="punch-status-item">
                <div className="punch-status-value">{fmt(firstClockIn)}</div>
                <div className="punch-status-label">Clock In</div>
              </div>
              <div className="punch-status-divider" />
              <div className="punch-status-item">
                <div className="punch-status-value">{uiState === 'onBreak' ? '⏸️' : uiState === 'done' ? fmt(todayRec?.punchOut) : '—'}</div>
                <div className="punch-status-label">{uiState === 'onBreak' ? 'On Break' : 'End Time'}</div>
              </div>
              <div className="punch-status-divider" />
              <div className="punch-status-item">
                <div className="punch-status-value">
                  {uiState === 'done' ? `${todayRec?.totalHours}h` : `${liveHours.toFixed(2)}h`}
                </div>
                <div className="punch-status-label">Hours</div>
              </div>
              <div className="punch-status-divider" />
              <div className="punch-status-item">
                <div className="punch-status-value" style={{ color: overtime > 0 ? '#fbbf24' : 'inherit' }}>
                  {uiState === 'done'
                    ? `${todayRec?.overtimeHours || 0}h`
                    : overtime > 0 ? `+${overtime.toFixed(2)}h` : '—'}
                </div>
                <div className="punch-status-label">Overtime</div>
              </div>
            </div>
          </div>

          {/* ── Sessions ── */}
          {todayRec?.sessions?.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header-custom">
                <div className="card-title">Today's Sessions</div>
                <span className="badge-custom badge-info">{todayRec.sessions.length} session{todayRec.sessions.length > 1 ? 's' : ''}</span>
              </div>
              {todayRec.sessions.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < todayRec.sessions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: s.clockOut ? '#dcfce7' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: s.clockOut ? '#15803d' : '#a16207', flexShrink: 0 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Session {i + 1}</div>
                      {s.note && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>"{s.note}"</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                      {fmt(s.clockIn)} → {s.clockOut ? fmt(s.clockOut) : <span style={{ color: '#10b981', fontWeight: 700 }}>Active</span>}
                    </div>
                    {s.clockOut && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{((new Date(s.clockOut) - new Date(s.clockIn)) / 3_600_000).toFixed(2)}h</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Rules ── */}
          <div style={{ marginTop: 14, background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>📋 How It Works</div>
            {[
              { icon: '🟢', text: 'Clock In — start working (reason required)' },
              { icon: '🍽️', text: 'Lunch — go on lunch break (reason required)' },
              { icon: '▶️', text: 'Resume — come back from break (reason required)' },
              { icon: '⏸️', text: 'Clock Out — step out temporarily, can resume anytime' },
              { icon: '🔴', text: 'End Day — final exit, needs 9h, cannot resume after' },
              { icon: '🔔', text: 'Auto reminder at 12:30 PM & when 9h is reached' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#64748b', marginBottom: 5 }}>
                <span>{r.icon}</span><span>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT: Monthly Table ══════════════════════════════════════════ */}
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header-custom">
              <div>
                <div className="card-title">This Month's Attendance</div>
                <div className="card-subtitle">{records.length} records</div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                <span style={{ color: '#10b981', fontWeight: 600 }}>✅ {records.filter(r => r.status === 'present').length} Present</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>📅 {records.filter(r => r.status === 'leave').length} Leave</span>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Sessions</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>No records this month</td></tr>
                  ) : records.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      </td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{fmt(r.punchIn)}</td>
                      <td style={{ color: r.punchOut ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>{fmt(r.punchOut)}</td>
                      <td><strong style={{ color: r.totalHours >= 9 ? '#10b981' : r.totalHours > 0 ? '#f59e0b' : '#94a3b8' }}>{r.totalHours ? `${r.totalHours}h` : '—'}</strong></td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>{r.sessions?.length || (r.punchIn ? 1 : 0)}</td>
                      <td><Badge value={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODALS ════════════════════════════════════════════════════════════ */}

      <ReasonModal show={modal === 'clockin'} onClose={() => setModal(null)} onConfirm={doClockIn} loading={actionLoading}
        iconEl={uiState === 'onBreak' ? <FiPlay /> : <FiLogIn />}
        title={uiState === 'onBreak' ? 'Resume Work' : 'Clock In'}
        subtitle={uiState === 'onBreak' ? 'Resuming work after break' : `Starting at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        placeholder={uiState === 'onBreak' ? 'e.g. Lunch done, resuming project work...' : 'e.g. Starting morning shift, working on feature development...'}
        confirmLabel={uiState === 'onBreak' ? 'Resume Work' : 'Clock In'}
        confirmClass="btn-primary-custom" />

      <ReasonModal show={modal === 'lunch'} onClose={() => setModal(null)} onConfirm={doLunch} loading={actionLoading}
        iconEl={<FiCoffee />}
        title="Start Lunch Break"
        subtitle={`Going on lunch at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        placeholder="e.g. Going for lunch, back in 30-45 minutes..."
        confirmLabel="Start Lunch Break"
        confirmClass="btn-success-custom" />

      <ReasonModal show={modal === 'clockout'} onClose={() => setModal(null)} onConfirm={doClockOut} loading={actionLoading}
        iconEl={<FiLogOut />}
        title="Clock Out (Temporary)"
        subtitle="You can clock back in anytime after this"
        placeholder="e.g. Stepping out for a meeting, will be back shortly..."
        confirmLabel="Clock Out"
        confirmClass="btn-outline-custom"
        warning="This is a temporary clock-out. You can resume work by clicking Clock In again." />

      <ReasonModal show={modal === 'endday'} onClose={() => setModal(null)} onConfirm={doEndDay} loading={actionLoading}
        iconEl={<FiPower />}
        title="End Work Day"
        subtitle={`${liveHours.toFixed(2)}h worked — 9h requirement met ✓`}
        placeholder="e.g. Completed all tasks for today, heading home..."
        confirmLabel="End Day"
        confirmClass="btn-danger-custom"
        warning="This will permanently end your work day. You cannot clock in again today after this." />
    </div>
  )
}

export default AttendanceEmployee
