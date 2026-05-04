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
    let updateData = { ...req.body };

    // 1. Hứng danh sách các file CŨ mà người dùng muốn GIỮ LẠI
    let retained = req.body.retainedAttachments || [];
    // Nếu chỉ có 1 file, FormData sẽ gửi dạng chuỗi (String), ta cần ép nó về mảng (Array)
    if (typeof retained === 'string') {
      retained = [retained];
    }

    // 2. Xử lý gộp file cũ và file mới tải lên
    if (req.files && req.files.length > 0) {
      const newFilePaths = req.files.map(file => file.path);
      updateData.attachments = [...retained, ...newFilePaths]; // Nối cũ và mới
    } else {
      updateData.attachments = retained; // Chỉ lưu những file cũ chưa bị xóa
    }

    // 3. Tiến hành lưu vào database
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Không tìm thấy công việc!" });
    res.status(200).json(task);

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật công việc" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    // Hứng mảng file do Multer đẩy lên
    const filePaths = req.files ? req.files.map(file => file.path) : [];

    // Tìm task và nhét (push) comment mới vào mảng comments
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $push: { comments: { text: text, attachments: filePaths } } },
      { new: true } // Trả về task mới nhất sau khi update
    );

    if (!task) return res.status(404).json({ message: "Không tìm thấy công việc" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm comment" });
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