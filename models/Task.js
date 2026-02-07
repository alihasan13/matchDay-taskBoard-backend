const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['To-Do', 'In-Progress', 'Done'],
      message: '{VALUE} is not a valid status'
    },
    default: 'To-Do'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
taskSchema.index({ status: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
