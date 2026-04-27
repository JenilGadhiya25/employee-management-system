const User = require('../models/User');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin/Manager
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, role, search } = req.query;
    const query = { isActive: true };

    if (department) query.department = department;
    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: 'i' };

    const employees = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, designation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const employee = await User.create({ name, email, password, role, department, designation });
    const result = employee.toObject();
    delete result.password;

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private — admin can update anyone; employee can only update themselves
exports.updateEmployee = async (req, res) => {
  try {
    const requesterId = req.user._id.toString();
    const targetId = req.params.id;

    // Only allow if admin/manager OR updating own profile
    if (req.user.role === 'employee' && requesterId !== targetId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update another employee' });
    }

    const fieldsToUpdate = { ...req.body };
    // Employees cannot change their own role
    if (req.user.role === 'employee') {
      delete fieldsToUpdate.role;
    }
    delete fieldsToUpdate.password; // password changes handled separately

    const employee = await User.findByIdAndUpdate(targetId, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete (deactivate) employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
