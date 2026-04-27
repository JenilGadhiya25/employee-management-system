const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'manager'), getAllEmployees);
router.get('/:id', getEmployee);
router.post('/', authorize('admin'), createEmployee);

// Allow admin OR the employee themselves to update their own profile
router.put('/:id', updateEmployee);

router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;
