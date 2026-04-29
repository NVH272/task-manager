const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
  try {
    // req.user.id được lấy từ middleware auth
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách công việc" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const filePaths = req.files ? req.files.map(file => file.path) : [];
    const newTask = new Task({
      ...req.body,
      attachments: filePaths,
      user: req.user.id // Đóng dấu bản quyền cho người tạo
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo công việc" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    // 1. Gom các dữ liệu chữ (title, description, deadline, priority) vào 1 cục
    let updateData = { ...req.body };

    // 2. Nếu người dùng có chọn file mới để upload lên thì cập nhật lại mảng attachments
    if (req.files && req.files.length > 0) {
      updateData.attachments = req.files.map(file => file.path);
    }

    // 3. Tiến hành lưu vào database
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc!" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật công việc" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id // Phải là task của mình thì mới được xóa
    });

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc hoặc bạn không có quyền xóa!" });
    }

    res.status(200).json({ message: "Đã xóa công việc" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa công việc" });
  }
};