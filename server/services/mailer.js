const nodemailer = require("nodemailer");

// Cấu hình tài khoản gửi mail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "nguyenviethoang435@gmail.com", // ĐIỀN EMAIL CỦA BẠN VÀO ĐÂY
        pass: "ihbclgpxntdcnova", // ĐIỀN MẬT KHẨU ỨNG DỤNG (App Password) VÀO ĐÂY
    },
});

const sendDeadlineEmail = async (toEmail, taskTitle, timeMessage) => {
    try {
        const mailOptions = {
            from: '"VHTask Notification" <nguyenviethoang435@gmail.com>',
            to: toEmail,
            subject: `[VHTask] Cảnh báo thời hạn: ${taskTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #3A924A;">VHTask - Nhắc nhở công việc</h2>
            <p>Xin chào,</p>
            <p>Công việc <strong>"${taskTitle}"</strong> của bạn <strong>${timeMessage}</strong>.</p>
            <p>Vui lòng kiểm tra và hoàn thành công việc đúng hạn nhé!</p>
            <br/>
            <p>Trân trọng,<br/>Đội ngũ VHTask</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi email nhắc nhở cho task: ${taskTitle}`);
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
    }
};

module.exports = { sendDeadlineEmail };