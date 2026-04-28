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
    // Tìm task theo ID và ID của user, sau đó cập nhật tiêu đề mới
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Điều kiện tìm kiếm
      { $set: req.body }, // Dữ liệu cập nhật
      { new: true } // Trả về dữ liệu mới sau khi sửa
    );

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc hoặc bạn không có quyền sửa!" });
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