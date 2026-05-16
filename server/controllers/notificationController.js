const Notification = require("../models/Notification");

// 1. Lấy danh sách thông báo của user hiện tại
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 }) // Mới nhất lên đầu
            .limit(20); // Lấy 20 thông báo gần nhất cho nhẹ
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông báo" });
    }
};

// 2. Đánh dấu 1 thông báo là đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: { isRead: true } },
            { returnDocument: 'after' }
        );
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật thông báo" });
    }
};

// 3. Đánh dấu tất cả là đã đọc
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: "Đã đọc tất cả" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật thông báo" });
    }
};