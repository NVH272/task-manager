const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment
} = require("../controllers/taskController");

const multer = require("multer");
const path = require("path");

// --- CẤU HÌNH MULTER ĐỂ GIỮ NGUYÊN ĐỊNH DẠNG FILE ---
const storage = multer.diskStorage({
  // Nơi lưu trữ file
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  // Cách đặt tên file
  filename: function (req, file, cb) {
    // Tạo ra một tên mới: Thời_gian_hiện_tại + Tên_file_gốc
    // Ví dụ: 1714392000000-BaoCao.pdf
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Các routes có sử dụng auth middleware
router.get("/", auth, getTasks);
router.post("/", auth, upload.array("attachments"), createTask);
router.put("/:id", auth, upload.array("attachments"), updateTask);
router.delete("/:id", auth, deleteTask);
router.post("/:id/comments", auth, upload.array("attachments"), addComment);

module.exports = router;