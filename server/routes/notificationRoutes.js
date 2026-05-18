const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
    getNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
} = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.post("/", auth, createNotification);
router.put("/:id", auth, updateNotification);
router.delete("/:id", auth, deleteNotification);