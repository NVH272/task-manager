const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  attachments: [{
    type: String
  }],
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // Kiểu dữ liệu là ID của MongoDB
    ref: "User", // Liên kết với bảng User
    required: true // Bắt buộc mọi Task phải có chủ
  },
  deadline: {
    type: Date
  },
  notifiedAt: {
    oneDay: { type: Boolean, default: false },
    oneHour: { type: Boolean, default: false },
    thirtyMins: { type: Boolean, default: false },
    fiveMins: { type: Boolean, default: false },
    overdueTenMins: { type: Boolean, default: false }
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);