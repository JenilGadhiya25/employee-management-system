const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const createNotification = require('../utils/createNotification');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res) => {
  try {
    const { leaveDate, reason } = req.body;

    const leave = await Leave.create({
      employeeId: req.user.id,
      leaveDate,
      reason,
    });

    // Notify admins/managers - here we notify the requesting user as confirmation
    await createNotification(
      req.user.id,
      `Your leave request for ${new Date(leaveDate).toDateString()} has been submitted and is pending approval`,
      'leave',
      leave._id
    );

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private/Admin/Manager
exports.getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('employeeId', 'name email department designation')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve leave
// @route   PUT /api/leaves/:id/approve
// @access  Private/Admin/Manager
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave request already processed' });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user.id;
    leave.approvalDate = new Date();
    await leave.save();

    // Mark attendance as leave for that date
    const leaveDay = new Date(leave.leaveDate);
    leaveDay.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      { employeeId: leave.employeeId, date: leaveDay },
      { status: 'leave', employeeId: leave.employeeId, date: leaveDay },
      { upsert: true, new: true }
    );

    // Notify employee
    await createNotification(
      leave.employeeId,
      `Your leave request for ${new Date(leave.leaveDate).toDateString()} has been approved`,
      'leave',
      leave._id
    );

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject leave
// @route   PUT /api/leaves/:id/reject
// @access  Private/Admin/Manager
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Leave request already processed' });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user.id;
    leave.approvalDate = new Date();
    await leave.save();

    // Notify employee
    await createNotification(
      leave.employeeId,
      `Your leave request for ${new Date(leave.leaveDate).toDateString()} has been rejected`,
      'leave',
      leave._id
    );

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaves for a specific employee (self-service)
// @route   GET /api/leaves/employee/:employeeId
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
