const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  clockIn:  { type: Date, required: true },
  clockOut: { type: Date, default: null },
  note:     { type: String, default: '' },
}, { _id: false });

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    sessions: {
      type: [sessionSchema],
      default: [],
    },
    punchIn:     { type: Date,    default: null },
    punchOut:    { type: Date,    default: null },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'half-day'],
      default: 'absent',
    },
    totalHours:  { type: Number,  default: 0 },
    overtimeHours: { type: Number, default: 0 },  // hours worked after 6:30 PM
    onBreak:     { type: Boolean, default: false },
    dayEnded:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Recalculate totalHours + overtimeHours from all sessions
attendanceSchema.methods.recalculate = function () {
  let totalMs    = 0;
  let overtimeMs = 0;

  // 6:30 PM cutoff time (18:30)
  const cutoff = new Date(this.date);
  cutoff.setHours(18, 30, 0, 0);

  for (const s of this.sessions) {
    if (s.clockIn && s.clockOut) {
      const start = new Date(s.clockIn);
      const end   = new Date(s.clockOut);
      totalMs += end - start;

      // If session extends past 6:30 PM → count overtime
      if (end > cutoff) {
        const overtimeStart = start > cutoff ? start : cutoff;
        overtimeMs += end - overtimeStart;
      }
    }
  }

  this.totalHours    = parseFloat((totalMs / 3_600_000).toFixed(2));
  this.overtimeHours = parseFloat((overtimeMs / 3_600_000).toFixed(2));

  if (this.sessions.length > 0) {
    this.punchIn = this.sessions[0].clockIn;
    this.status  = 'present';
    if (this.dayEnded) {
      const last = this.sessions[this.sessions.length - 1];
      this.punchOut = last.clockOut || null;
    }
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);
