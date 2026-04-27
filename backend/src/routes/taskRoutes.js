const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTasksByEmployee,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Specific routes BEFORE param routes to avoid Express matching /employee as :id
router.post('/', authorize('admin', 'manager'), createTask);
router.get('/', authorize('admin', 'manager'), getAllTasks);
router.get('/employee/:id', getTasksByEmployee);          // must be before /:id

router.put('/:id/status', updateTaskStatus);              // must be before /:id
router.put('/:id', authorize('admin', 'manager'), updateTask);
router.delete('/:id', authorize('admin', 'manager'), deleteTask);

module.exports = router;
