const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
// Cấp quyền cho client truy cập vào thư mục 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

// passport config
const passport = require("passport");
require("./config/passport");
app.use(passport.initialize());

// task routes
const taskRoutes = require("./routes/taskRoutes");
app.use("/tasks", taskRoutes);

// auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// deadline job
const startDeadlineJob = require("./jobs/deadlineJob");
startDeadlineJob(); // Bắt đầu chạy công việc kiểm tra deadline mỗi phút

// notification routes
const notificationRoutes = require("./routes/notificationRoutes.js");
app.use("/notifications", notificationRoutes);

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// run server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});