const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /api/tasks - Fetch all tasks
router.get('/', taskController.getAllTasks);

// GET /api/tasks/:id - Get single task
router.get('/:id', taskController.getTaskById);

// POST /api/tasks - Create a new task
router.post('/', taskController.createTask);

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', taskController.updateTaskStatus);

module.exports = router;
