const cron = require("node-cron");
const Task = require("../models/Task");
const { sendDeadlineEmail } = require("../services/mailer");

// Quy đổi thời gian ra mili-giây để tính toán
const MS_PER_MINUTE = 60 * 1000;
const ONE_DAY = 24 * 60 * MS_PER_MINUTE;
const ONE_HOUR = 60 * MS_PER_MINUTE;
const THIRTY_MINS = 30 * MS_PER_MINUTE;
const FIVE_MINS = 5 * MS_PER_MINUTE;
const OVERDUE_TEN_MINS = -10 * MS_PER_MINUTE; // Số âm vì deadline đã qua

const startDeadlineJob = () => {
    // "* * * * *" nghĩa là hàm này sẽ tự động chạy MỖI PHÚT
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();

            // 1. Tìm TẤT CẢ các task CHƯA hoàn thành VÀ CÓ deadline
            // Dùng .populate('user') để lấy được email của người tạo task
            const tasks = await Task.find({ completed: false, deadline: { $ne: null } }).populate("user");

            for (let task of tasks) {
                // Nếu user không có email thì bỏ qua
                if (!task.user || !task.user.email) continue;

                // Tính khoảng thời gian còn lại (mili-giây)
                const diff = new Date(task.deadline).getTime() - now.getTime();
                let shouldSave = false;

                // --- KIỂM TRA TỪNG MỐC THỜI GIAN ---
                // Lưu ý: Mình kẹp thêm điều kiện chặn trên (ví dụ diff > ONE_HOUR) 
                // để tránh việc task vừa tạo sát giờ bị gửi 1 lúc 3-4 cái email

                // 1. Còn 1 ngày (Khoảng từ 23h59m đến 24h)
                if (diff <= ONE_DAY && diff > ONE_HOUR && !task.notifiedAt.oneDay) {
                    await sendDeadlineEmail(task.user.email, task.title, "sẽ hết hạn trong 1 ngày nữa");
                    task.notifiedAt.oneDay = true;
                    shouldSave = true;
                }

                // 2. Còn 1 giờ (Khoảng từ 30m đến 60m)
                else if (diff <= ONE_HOUR && diff > THIRTY_MINS && !task.notifiedAt.oneHour) {
                    await sendDeadlineEmail(task.user.email, task.title, "sẽ hết hạn trong 1 giờ nữa");
                    task.notifiedAt.oneHour = true;
                    shouldSave = true;
                }

                // 3. Còn 30 phút (Khoảng từ 5m đến 30m)
                else if (diff <= THIRTY_MINS && diff > FIVE_MINS && !task.notifiedAt.thirtyMins) {
                    await sendDeadlineEmail(task.user.email, task.title, "sẽ hết hạn trong 30 phút nữa");
                    task.notifiedAt.thirtyMins = true;
                    shouldSave = true;
                }

                // 4. Còn 5 phút (Khoảng từ 0m đến 5m)
                else if (diff <= FIVE_MINS && diff > 0 && !task.notifiedAt.fiveMins) {
                    await sendDeadlineEmail(task.user.email, task.title, "RẤT GẤP: Sẽ hết hạn trong 5 phút nữa");
                    task.notifiedAt.fiveMins = true;
                    shouldSave = true;
                }

                // 5. Quá hạn 10 phút (Khoảng từ -10m đến -11m)
                else if (diff <= OVERDUE_TEN_MINS && diff > (OVERDUE_TEN_MINS - MS_PER_MINUTE) && !task.notifiedAt.overdueTenMins) {
                    await sendDeadlineEmail(task.user.email, task.title, "ĐÃ QUÁ HẠN 10 PHÚT");
                    task.notifiedAt.overdueTenMins = true;
                    shouldSave = true;
                }

                // Nếu có gửi mail nào ở trên, thì lưu task lại để update cờ notifiedAt
                if (shouldSave) {
                    await task.save();
                }
            }
        } catch (error) {
            console.error("Lỗi khi chạy quét deadline:", error);
        }
    });
};

module.exports = startDeadlineJob;