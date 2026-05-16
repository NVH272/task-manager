const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task", // Link tới task để sau này bấm vào thông báo có thể mở task lên
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false // Mặc định là chưa đọc
    }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);