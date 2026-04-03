const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name, 
      email,
      password: hashedPassword
    });

    await user.save();
    res.json({ message: "Đăng ký thành công" });

  } catch (error) {
    // In lỗi ra terminal của Docker để xem
    console.error("LỖI ĐĂNG KÝ BỊ BẮT:", error); 
    
    // Trả lỗi dạng JSON về cho Frontend
    res.status(500).json({ message: error.message || "Lỗi server nội bộ" }); 
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Không tìm thấy user" });

  if (!user.password) {
    return res.status(400).json({ message: "Tài khoản dùng Google login" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
};