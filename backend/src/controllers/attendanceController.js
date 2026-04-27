const Attendance = require('../models/Attendance');

// End-of-day cutoff: 6:30 PM (18:30)
const EOD_HOUR   = 18;
const EOD_MINUTE = 30;

const getTodayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Migrate old-format records (punchIn/punchOut only, no sessions array)
const migrateRecord = (record) => {
  if (!record) return record;
  if (record.punchIn && (!record.sessions || record.sessions.length === 0)) {
    record.sessions = [{
      clockIn:  record.punchIn,
      clockOut: record.punchOut || null,
      note: '',
    }];
    // If old record had punchOut, treat it as day ended
    if (record.punchOut) record.dayEnded = true;
  }
  return record;
};

// ─── Clock In / Resume ────────────────────────────────────────────────────────
// POST /api/attendance/punchin
// Works for: first clock-in, resume after lunch, resume after any clock-out
exports.punchIn = async (req, res) => {
  try {
    const today = getTodayDate();
    const { note } = req.body;
    let record = await Attendance.findOne({ employeeId: req.user.id, date: today });

    // ── First clock-in of the day ──
    if (!record) {
      record = await Attendance.create({
        employeeId: req.user.id,
        date:       today,
        sessions:   [{ clockIn: new Date(), note: note || '' }],
        punchIn:    new Date(),
        status:     'present',
        onBreak:    false,
        dayEnded:   false,
      });
      return res.status(201).json({ success: true, data: record });
    }

    migrateRecord(record);

    // ── Day already ended (user clicked End Day) ──
    if (record.dayEnded) {
      return res.status(400).json({
        success: false,
        message: 'Your work day has been ended. See you tomorrow!',
      });
    }

    // ── Already working (not on break) ──
    if (!record.onBreak) {
      // Edge case: corrupted record with no sessions
      if (!record.sessions || record.sessions.length === 0) {
        record.sessions = [{ clockIn: new Date(), note: note || '' }];
        record.punchIn  = new Date();
        record.status   = 'present';
        record.onBreak  = false;
        await record.save();
        return res.status(200).json({ success: true, data: record });
      }
      return res.status(400).json({
        success: false,
        message: 'Already clocked in. Use Lunch Break or Clock Out first.',
      });
    }

    // ── On break → resume (add new session) ──
    record.sessions.push({ clockIn: new Date(), note: note || '' });
    record.onBreak = false;
    record.recalculate();
    await record.save();

    return res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Lunch Break ──────────────────────────────────────────────────────────────
// PUT /api/attendance/lunch
// Closes current session, sets onBreak=true. User can resume with punchIn.
exports.lunchBreak = async (req, res) => {
  try {
    const today = getTodayDate();
    const { note } = req.body;
    const record = await Attendance.findOne({ employeeId: req.user.id, date: today });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Clock in first.' });
    }
    migrateRecord(record);

    if (record.dayEnded) {
      return res.status(400).json({ success: false, message: 'Day already ended.' });
    }
    if (record.onBreak) {
      return res.status(400).json({ success: false, message: 'Already on break.' });
    }
    if (!record.sessions || record.sessions.length === 0) {
      return res.status(400).json({ success: false, message: 'Clock in first.' });
    }

    // Close current open session
    const last = record.sessions[record.sessions.length - 1];
    if (!last.clockOut) {
      last.clockOut = new Date();
      if (note) last.note = (last.note ? last.note + ' | ' : '') + note;
    }
    record.onBreak = true;
    record.recalculate();
    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Clock Out (temporary) ────────────────────────────────────────────────────
// PUT /api/attendance/punchout
// Closes current session. User CAN clock back in after this (not day-end).
// This is used for short breaks, stepping out, etc.
exports.punchOut = async (req, res) => {
  try {
    const today = getTodayDate();
    const { note } = req.body;
    const record = await Attendance.findOne({ employeeId: req.user.id, date: today });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No clock-in record found.' });
    }
    migrateRecord(record);

    if (record.dayEnded) {
      return res.status(400).json({ success: false, message: 'Day already ended.' });
    }
    if (record.onBreak) {
      return res.status(400).json({ success: false, message: 'On break. Resume first, then clock out.' });
    }
    if (!record.sessions || record.sessions.length === 0) {
      return res.status(400).json({ success: false, message: 'No active session.' });
    }

    // Close current open session — but do NOT set dayEnded
    const last = record.sessions[record.sessions.length - 1];
    if (!last.clockOut) {
      last.clockOut = new Date();
      if (note) last.note = note;
    }

    // Set onBreak=true so user can clock back in
    record.onBreak = true;
    record.recalculate();
    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── End Day (final clock-out) ────────────────────────────────────────────────
// PUT /api/attendance/endday
// Permanently ends the work day. No minimum hour restriction.
// Overtime is auto-calculated for time worked after 6:30 PM.
exports.endDay = async (req, res) => {
  try {
    const today = getTodayDate();
    const { note } = req.body;
    const record = await Attendance.findOne({ employeeId: req.user.id, date: today });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No attendance record found.' });
    }
    migrateRecord(record);

    if (record.dayEnded) {
      return res.status(400).json({ success: false, message: 'Day already ended.' });
    }
    if (record.onBreak) {
      return res.status(400).json({ success: false, message: 'On break. Resume first, then end day.' });
    }

    // Close last open session if still open
    if (record.sessions && record.sessions.length > 0) {
      const last = record.sessions[record.sessions.length - 1];
      if (!last.clockOut) {
        last.clockOut = new Date();
        if (note) last.note = note;
      }
    }

    record.recalculate();
    record.dayEnded = true;
    record.punchOut = record.sessions[record.sessions.length - 1].clockOut;
    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Today's record ───────────────────────────────────────────────────────────
exports.getToday = async (req, res) => {
  try {
    const today = getTodayDate();
    const record = await Attendance.findOne({ employeeId: req.user.id, date: today });
    if (record) migrateRecord(record);
    res.status(200).json({ success: true, data: record || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── All attendance (admin) ───────────────────────────────────────────────────
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = {};
    if (date) { const d = new Date(date); d.setHours(0,0,0,0); query.date = d; }
    if (status) query.status = status;
    const records = await Attendance.find(query)
      .populate('employeeId', 'name email department designation')
      .sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── By employee ──────────────────────────────────────────────────────────────
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { employeeId: req.params.employeeId };
    if (month && year) {
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      };
    }
    const records = await Attendance.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get all employees currently clocked in today (admin view) ───────────────
// GET /api/attendance/active-now
exports.getActiveNow = async (req, res) => {
  try {
    const today = getTodayDate();
    const records = await Attendance.find({
      date: today,
      dayEnded: false,
      onBreak: false,
      punchIn: { $ne: null },
    })
      .populate('employeeId', 'name email department designation role')
      .sort({ punchIn: 1 });

    // Only return employees and managers (not admins)
    const filtered = records.filter(r =>
      r.employeeId && ['employee', 'manager'].includes(r.employeeId.role)
    );

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
