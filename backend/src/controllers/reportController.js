const DailyReport = require('../models/DailyReport');
const Task = require('../models/Task');

// Helper: calculate productivity score based on completed tasks
const calculateProductivityScore = async (employeeId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const totalTasks = await Task.countDocuments({
    assignedTo: employeeId,
    deadline: { $gte: start, $lte: end },
  });

  const completedTasks = await Task.countDocuments({
    assignedTo: employeeId,
    status: 'completed',
    completedAt: { $gte: start, $lte: end },
  });

  if (totalTasks === 0) return 50; // neutral score if no tasks
  return Math.round((completedTasks / totalTasks) * 100);
};

// @desc    Submit daily report
// @route   POST /api/reports/daily
// @access  Private
exports.submitDailyReport = async (req, res) => {
  try {
    const { completedWork, pendingWork, issues } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await DailyReport.findOne({ employeeId: req.user.id, date: today });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Daily report already submitted for today' });
    }

    const productivityScore = await calculateProductivityScore(req.user.id, today);

    const report = await DailyReport.create({
      employeeId: req.user.id,
      date: today,
      completedWork,
      pendingWork,
      issues,
      productivityScore,
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all daily reports
// @route   GET /api/reports
// @access  Private/Admin/Manager
exports.getAllReports = async (req, res) => {
  try {
    const { date } = req.query;
    const query = {};

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }

    const reports = await DailyReport.find(query)
      .populate('employeeId', 'name email department designation')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reports by employee ID
// @route   GET /api/reports/:employeeId
// @access  Private
exports.getReportsByEmployee = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { employeeId: req.params.employeeId };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const reports = await DailyReport.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
