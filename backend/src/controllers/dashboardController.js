const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const DailyReport = require('../models/DailyReport');
const Leave = require('../models/Leave');

// @desc    Get overall dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin/Manager
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userId = req.user._id;
    const userRole = req.user.role;

    // Build filter based on role
    let employeeFilter = { isActive: true, role: 'employee' };
    
    if (userRole === 'manager') {
      // Manager sees only their team
      employeeFilter.managerId = userId;
    } else if (userRole === 'employee') {
      // Employee sees only themselves
      employeeFilter._id = userId;
    }
    // Admin sees all employees (no additional filter)

    const teamEmployees = await User.find(employeeFilter).select('_id');
    const employeeIds = teamEmployees.map(e => e._id);

    const [
      totalEmployees,
      presentToday,
      pendingLeaves,
      totalTasks,
      completedTasks,
      pendingTasks,
    ] = await Promise.all([
      User.countDocuments(employeeFilter),
      Attendance.countDocuments({ 
        employeeId: { $in: employeeIds }, 
        date: today, 
        status: 'present' 
      }),
      Leave.countDocuments({ 
        employeeId: { $in: employeeIds }, 
        status: 'pending' 
      }),
      Task.countDocuments({ assignedTo: { $in: employeeIds } }),
      Task.countDocuments({ 
        assignedTo: { $in: employeeIds }, 
        status: 'completed' 
      }),
      Task.countDocuments({ 
        assignedTo: { $in: employeeIds }, 
        status: 'pending' 
      }),
    ]);

    const absentToday = totalEmployees - presentToday;

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        pendingLeaves,
        totalTasks,
        completedTasks,
        pendingTasks,
        taskCompletionRate:
          totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get productivity scores per employee
// @route   GET /api/dashboard/productivity
// @access  Private/Admin/Manager
exports.getProductivity = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const userId = req.user._id;
    const userRole = req.user.role;

    const start = new Date(currentYear, currentMonth - 1, 1);
    const end = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Build employee filter based on role
    let employeeFilter = { isActive: true, role: 'employee' };
    
    if (userRole === 'manager') {
      employeeFilter.managerId = userId;
    } else if (userRole === 'employee') {
      employeeFilter._id = userId;
    }

    const teamEmployees = await User.find(employeeFilter).select('_id');
    const employeeIds = teamEmployees.map(e => e._id);

    const productivity = await DailyReport.aggregate([
      { 
        $match: { 
          date: { $gte: start, $lte: end },
          employeeId: { $in: employeeIds }
        } 
      },
      {
        $group: {
          _id: '$employeeId',
          avgProductivityScore: { $avg: '$productivityScore' },
          totalReports: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$_id',
          name: '$employee.name',
          department: '$employee.department',
          designation: '$employee.designation',
          avgProductivityScore: { $round: ['$avgProductivityScore', 2] },
          totalReports: 1,
        },
      },
      { $sort: { avgProductivityScore: -1 } },
    ]);

    res.status(200).json({ success: true, count: productivity.length, data: productivity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly attendance summary
// @route   GET /api/dashboard/monthly-attendance
// @access  Private/Admin/Manager
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const userId = req.user._id;
    const userRole = req.user.role;

    const start = new Date(currentYear, currentMonth - 1, 1);
    const end = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Build employee filter based on role
    let employeeFilter = { isActive: true, role: 'employee' };
    
    if (userRole === 'manager') {
      employeeFilter.managerId = userId;
    } else if (userRole === 'employee') {
      employeeFilter._id = userId;
    }

    const teamEmployees = await User.find(employeeFilter).select('_id');
    const employeeIds = teamEmployees.map(e => e._id);

    const attendance = await Attendance.aggregate([
      { 
        $match: { 
          date: { $gte: start, $lte: end },
          employeeId: { $in: employeeIds }
        } 
      },
      {
        $group: {
          _id: '$employeeId',
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          leaveDays: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
          totalHours: { $sum: '$totalHours' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$_id',
          name: '$employee.name',
          department: '$employee.department',
          presentDays: 1,
          absentDays: 1,
          leaveDays: 1,
          totalHours: { $round: ['$totalHours', 2] },
        },
      },
      { $sort: { presentDays: -1 } },
    ]);

    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get task summary per employee
// @route   GET /api/dashboard/task-summary
// @access  Private/Admin/Manager
exports.getTaskSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build employee filter based on role
    let employeeFilter = { isActive: true, role: 'employee' };
    
    if (userRole === 'manager') {
      employeeFilter.managerId = userId;
    } else if (userRole === 'employee') {
      employeeFilter._id = userId;
    }

    const teamEmployees = await User.find(employeeFilter).select('_id');
    const employeeIds = teamEmployees.map(e => e._id);

    const taskSummary = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: employeeIds }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$_id',
          name: '$employee.name',
          department: '$employee.department',
          designation: '$employee.designation',
          total: 1,
          completed: 1,
          pending: 1,
          inProgress: 1,
          cancelled: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completed', { $max: ['$total', 1] }] }, 100] },
              2,
            ],
          },
        },
      },
      { $sort: { completionRate: -1 } },
    ]);

    res.status(200).json({ success: true, count: taskSummary.length, data: taskSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get calendar data for a month — attendance status per day + leave quota
// @route   GET /api/dashboard/calendar?month=&year=
// @access  Private
exports.getCalendarData = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year  ? parseInt(year)  : new Date().getFullYear();

    const userId   = req.user._id;
    const userRole = req.user.role;

    // For employee → their own data only
    // For admin/manager → all team members
    let employeeFilter = { isActive: true, role: { $in: ['employee', 'manager'] } };
    if (userRole === 'manager') employeeFilter.managerId = userId;
    if (userRole === 'employee') employeeFilter._id = userId;

    const employees = await User.find(employeeFilter).select('_id name department designation');
    const employeeIds = employees.map(e => e._id);

    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 0, 23, 59, 59);

    // Fetch all attendance records for the month
    const records = await Attendance.find({
      employeeId: { $in: employeeIds },
      date: { $gte: start, $lte: end },
    }).lean();

    // Fetch approved leaves for the month
    const leaves = await Leave.find({
      employeeId: { $in: employeeIds },
      leaveDate:  { $gte: start, $lte: end },
      status: 'approved',
    }).lean();

    // Count approved leaves per employee this month (for quota check)
    const leaveCountMap = {};
    leaves.forEach(l => {
      const id = String(l.employeeId);
      leaveCountMap[id] = (leaveCountMap[id] || 0) + 1;
    });

    // Build per-employee calendar
    const FULL_DAY_HOURS = 9.5; // 9:00 AM → 6:30 PM = 9.5 hours = full day
    const FREE_LEAVE_QUOTA = 4;  // 4 free leaves per month

    const calendarByEmployee = employees.map(emp => {
      const empId = String(emp._id);
      const empRecords = records.filter(r => String(r.employeeId) === empId);
      const empLeaves  = leaves.filter(l => String(l.employeeId) === empId);

      // Build a map: dateStr → record
      const recordMap = {};
      empRecords.forEach(r => {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        recordMap[key] = r;
      });

      const leaveSet = new Set();
      empLeaves.forEach(l => {
        const d = new Date(l.leaveDate);
        leaveSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      });

      // Build days array for the month
      const daysInMonth = new Date(y, m, 0).getDate();
      const today = new Date(); today.setHours(0,0,0,0);
      const days = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(y, m - 1, day);
        const key  = `${y}-${m - 1}-${day}`;
        const isSunday  = date.getDay() === 0;
        const isFuture  = date > today;
        const record    = recordMap[key];
        const isLeave   = leaveSet.has(key);

        let status = 'absent'; // default

        if (isSunday)  { status = 'sunday'; }
        else if (isFuture) { status = 'future'; }
        else if (isLeave)  { status = 'leave'; }
        else if (record) {
          if (record.status === 'leave') {
            status = 'leave';
          } else if (record.status === 'present') {
            // Green only if totalHours >= FULL_DAY_HOURS (worked till 6:30 PM)
            status = record.totalHours >= FULL_DAY_HOURS ? 'full' : 'partial';
          } else {
            status = 'absent';
          }
        }

        days.push({
          day,
          date: date.toISOString(),
          status,
          totalHours: record?.totalHours || 0,
          punchIn:    record?.punchIn    || null,
          punchOut:   record?.punchOut   || null,
        });
      }

      const usedLeaves  = leaveCountMap[empId] || 0;
      const paidLeaves  = Math.max(0, usedLeaves - FREE_LEAVE_QUOTA);
      const freeLeft    = Math.max(0, FREE_LEAVE_QUOTA - usedLeaves);

      return {
        employeeId:  emp._id,
        name:        emp.name,
        department:  emp.department,
        designation: emp.designation,
        days,
        leaveQuota: {
          total:      FREE_LEAVE_QUOTA,
          used:       usedLeaves,
          freeLeft,
          paidLeaves,
          isPaid:     paidLeaves > 0,
        },
      };
    });

    res.status(200).json({
      success: true,
      month: m,
      year:  y,
      data:  calendarByEmployee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
