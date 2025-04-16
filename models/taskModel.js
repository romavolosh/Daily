const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  subject: { 
    type: String, 
    required: true 
  },
  deadline: { 
    type: Date, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  completedBy: [{
    username: String,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;