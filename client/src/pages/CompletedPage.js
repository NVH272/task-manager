import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import API from "../services/api";
import TaskItem from "../components/Task/TaskItem";
import TaskDetailModal from "../components/Task/TaskDetailModal";

function CompletedPage() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    // Hứng dữ liệu tìm kiếm từ Layout truyền xuống (nếu bạn có thanh search chung)
    const outletContext = useOutletContext();
    const searchQuery = outletContext ? outletContext.searchQuery : "";
    const sortBy = outletContext ? outletContext.sortBy : "newest";

    const fetchTasks = async () => {
        try {
            const res = await API.get("/tasks");
            setTasks(res.data);
        } catch (error) {
            console.error("Lỗi khi tải tasks", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const toggleComplete = async (task) => {
        try {
            // Khi bấm bỏ tích ở trang này -> nó sẽ chuyển thành false và quay lại TaskPage
            await API.put(`/tasks/${task._id}`, {
                completed: !task.completed,
                retainedAttachments: task.attachments || []
            });
            fetchTasks();
            if (selectedTask && selectedTask._id === task._id) {
                setSelectedTask(null);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái", error);
        }
    };

    const deleteTask = async (id) => {
        try {
            await API.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error("Lỗi khi xóa task", error);
        }
    };

    // CHỈ LẤY TASK ĐÃ HOÀN THÀNH
    const displayedTasks = tasks
        .filter(task => task.completed === true)
        .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            // Sắp xếp mặc định lấy ngày cập nhật mới nhất cho phần completed
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });

    const styles = {
        container: { maxWidth: "800px", margin: "0 auto", padding: "20px 40px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
        header: { fontSize: "26px", fontWeight: "700", color: "#202020", marginBottom: "20px" },
        emptyState: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: "60px", color: "#666" },
        taskList: { listStyleType: "none", padding: 0, marginTop: "20px" },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Completed</h1>

            {displayedTasks.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏆</div>
                    <p style={{ fontSize: "15px", fontWeight: "500" }}>Chưa có công việc nào hoàn thành.</p>
                </div>
            ) : (
                <ul style={styles.taskList}>
                    {displayedTasks.map(task => (
                        <TaskItem
                            key={task._id}
                            task={task}
                            styles={styles}
                            // Truyền các hàm rỗng vì ở trang này chỉ xem và xoá, không cho sửa nội dung
                            editingId={null} setEditingId={() => { }}
                            editTitle={""} setEditTitle={() => { }}
                            description={""} setDescription={() => { }}
                            deadline={""} setDeadline={() => { }}
                            deadlineTime={""} setDeadlineTime={() => { }}
                            priority={""} setPriority={() => { }}
                            attachments={[]} setAttachments={() => { }}
                            saveEdit={() => { }} startEditing={() => { }}
                            retainedAttachments={[]} setRetainedAttachments={() => { }}
                            toggleComplete={toggleComplete}
                            deleteTask={deleteTask}
                            onViewDetails={setSelectedTask}
                        />
                    ))}
                </ul>
            )}

            {/* Vẫn cho xem chi tiết bằng Modal nhưng ẩn tính năng update data */}
            <TaskDetailModal
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                toggleComplete={toggleComplete}
                onUpdate={() => fetchTasks()} // Nếu đổi subtask thì tải lại
            />
        </div>
    );
}

export default CompletedPage;