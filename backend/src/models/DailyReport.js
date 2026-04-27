const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    completedWork: {
      type: String,
      required: true,
    },
    pendingWork: {
      type: String,
      required: true,
    },
    issues: {
      type: String,
      default: '',
    },
    productivityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one report per employee per day
dailyReportSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
