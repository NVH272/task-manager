const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Các routes có sử dụng auth middleware
router.get("/", auth, getTasks);
router.post("/", auth, upload.array("attachments"), createTask);
router.put("/:id", auth, upload.array("attachments"), updateTask);
router.delete("/:id", auth, deleteTask);

module.exports = router;