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

exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; // Lấy taskId (id) và commentId từ URL

    // Tìm task của user hiện tại và xóa comment có _id trùng khớp
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $pull: { comments: { _id: commentId } } },
      { new: true } // Trả về task mới sau khi đã xóa comment
    );

    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc hoặc bạn không có quyền xóa!" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Lỗi khi xóa comment:", error);
    res.status(500).json({ message: "Lỗi khi xóa comment" });
  }
};

// 1. Thêm Sub-task mới
exports.addSubtask = async (req, res) => {
  try {
    const { title } = req.body;

    // Tìm task và nhét (push) subtask mới vào mảng subtasks
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $push: { subtasks: { title: title, completed: false } } },
      { new: true } // Trả về task mới nhất sau khi update
    );

    if (!task) return res.status(404).json({ message: "Không tìm thấy công việc" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm sub-task" });
  }
};

// 2. Cập nhật Sub-task (Sửa tên HOẶC Check/Uncheck hoàn thành)
exports.updateSubtask = async (req, res) => {
  try {
    const { title, completed } = req.body;
    const { id, subtaskId } = req.params;

    // Xây dựng object update linh hoạt (có cái gì thì update cái đó)
    let updateFields = {};
    if (title !== undefined) updateFields["subtasks.$.title"] = title;
    if (completed !== undefined) updateFields["subtasks.$.completed"] = completed;

    // Toán tử $ trong Mongoose giúp tìm chính xác subtask đang được nhắm tới trong mảng
    const task = await Task.findOneAndUpdate(
      { _id: id, "subtasks._id": subtaskId, user: req.user.id },
      { $set: updateFields },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Không tìm thấy công việc hoặc sub-task" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật sub-task" });
  }
};

// 3. Xóa Sub-task
exports.deleteSubtask = async (req, res) => {
  try {
    const { id, subtaskId } = req.params;

    // Dùng $pull để móc subtask đó ra khỏi mảng và vứt đi
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $pull: { subtasks: { _id: subtaskId } } },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Không tìm thấy công việc" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa sub-task" });
  }
};