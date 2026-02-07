const Task = require('../models/Task');

// Simulated failure rate for testing rollback logic (10% chance)
const SIMULATED_FAILURE_RATE = 0.1;

/**
 * GET /tasks
 * Fetch all tasks
 */
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

/**
 * POST /tasks
 * Create a new task
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // Simulate random failure for testing
    if (Math.random() < SIMULATED_FAILURE_RATE) {
      return res.status(500).json({
        success: false,
        message: 'Simulated server error during task creation'
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: 'To-Do'
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

/**
 * PATCH /tasks/:id/status
 * Update task status with dependency validation
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['To-Do', 'In-Progress', 'Done'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Fetch the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // DEPENDENCY LOGIC: Cannot move to "Done" unless description length > 20
    if (status === 'Done' && task.description.length <= 20) {
      return res.status(400).json({
        success: false,
        message: 'Cannot move task to Done: Description must be longer than 20 characters',
        validationError: true,
        currentDescriptionLength: task.description.length
      });
    }

    // Simulate random failure for testing rollback (10% chance)
    if (Math.random() < SIMULATED_FAILURE_RATE) {
      return res.status(500).json({
        success: false,
        message: 'Simulated server error during status update'
      });
    }

    // Update the task
    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

/**
 * GET /tasks/:id
 * Get a single task (useful for debugging)
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};
