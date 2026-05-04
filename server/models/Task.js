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
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  comments: [{
    text: { type: String },
    attachments: [{ type: String }], // Lưu đường dẫn file đính kèm của comment
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);