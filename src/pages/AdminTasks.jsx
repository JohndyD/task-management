import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import DataTable from "datatables.net-bs5";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

import "../css/AdminTasks.css";

const CHECK_SESSION_URL =
    "http://localhost/task-management/php/check_session.php";

const GET_TASKS_URL =
    "http://localhost/task-management/php/admin/get_tasks.php";

const DELETE_TASK_URL =
    "http://localhost/task-management/php/admin/delete_task.php";


function AdminTasks() {

    const navigate = useNavigate();

    const tableRef = useRef(null);
    const dataTableRef = useRef(null);

    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [deleteTask, setDeleteTask] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState("");


    // ========================================
    // LOAD SESSION AND TASKS
    // ========================================

    useEffect(() => {

        let mounted = true;

        const loadPage = async () => {

            try {

                setLoading(true);
                setError("");


                // ========================================
                // CHECK SESSION
                // ========================================

                const sessionResponse = await axios.get(
                    CHECK_SESSION_URL,
                    {
                        withCredentials: true
                    }
                );

                const sessionData = sessionResponse.data;


                if (
                    !sessionData.success ||
                    !sessionData.loggedIn
                ) {

                    navigate("/login", {
                        replace: true
                    });

                    return;
                }


                // ========================================
                // CHECK ADMIN ROLE
                // ========================================

                if (
                    !sessionData.user ||
                    sessionData.user.role !== "admin"
                ) {

                    navigate("/login", {
                        replace: true
                    });

                    return;
                }


                // ========================================
                // SAVE USER
                // ========================================

                if (mounted) {

                    setUser(sessionData.user);

                }


                // ========================================
                // GET TASKS
                // ========================================

                const tasksResponse = await axios.get(
                    GET_TASKS_URL,
                    {
                        withCredentials: true
                    }
                );

                const tasksData = tasksResponse.data;


                console.log(
                    "Get Tasks Response:",
                    tasksData
                );


                // ========================================
                // CHECK RESPONSE
                // ========================================

                if (!tasksData.success) {

                    if (mounted) {

                        setError(
                            tasksData.message ||
                            "Failed to load tasks."
                        );

                    }

                    return;
                }


                // ========================================
                // SAVE TASKS
                // ========================================

                if (mounted) {

                    setTasks(
                        Array.isArray(tasksData.tasks)
                            ? [...tasksData.tasks].sort(
                                (a, b) =>
                                    Number(a.id) - Number(b.id)
                            )
                            : []
                    );

                }

            } catch (error) {

                console.error(
                    "Admin Tasks Error:",
                    error
                );


                if (
                    error.response &&
                    error.response.data
                ) {

                    console.error(
                        "Server Response:",
                        error.response.data
                    );

                }


                if (mounted) {

                    setError(
                        "Unable to load tasks. Please try again."
                    );

                }

            } finally {

                if (mounted) {

                    setLoading(false);

                }

            }

        };


        loadPage();


        return () => {

            mounted = false;

        };

    }, [navigate]);


    // ========================================
    // INITIALIZE DATATABLE
    // ========================================

    useEffect(() => {

        if (
            loading ||
            error ||
            tasks.length === 0 ||
            !tableRef.current
        ) {

            return;

        }


        // ========================================
        // DESTROY PREVIOUS DATATABLE
        // ========================================

        if (dataTableRef.current) {

            dataTableRef.current.destroy();

            dataTableRef.current = null;

        }


        // ========================================
        // INITIALIZE DATATABLE
        // ========================================

        dataTableRef.current = new DataTable(
            tableRef.current,
            {

                pageLength: 10,

                lengthMenu: [
                    [10, 25, 50, -1],
                    [10, 25, 50, "All"]
                ],

                order: [
                    [2, "asc"]
                ],

                autoWidth: false,

                columnDefs: [

                    // ACTION COLUMN
                    {
                        orderable: false,
                        searchable: false,
                        targets: 6
                    },

                    // NUMBER
                    {
                        width: "5%",
                        targets: 0
                    },

                    // TASK
                    {
                        width: "36%",
                        targets: 1
                    },

                    // DEADLINE
                    {
                        width: "20%",
                        targets: 2
                    },

                    // SCORE
                    {
                        width: "9%",
                        targets: 3
                    },

                    // STATUS
                    {
                        width: "10%",
                        targets: 4
                    },

                    // CREATED
                    {
                        width: "12%",
                        targets: 5
                    },

                    // ACTION
                    {
                        width: "8%",
                        targets: 6
                    }

                ],

                language: {

                    search: "",

                    searchPlaceholder:
                        "Search tasks...",

                    lengthMenu:
                        "Show _MENU_ tasks",

                    info:
                        "Showing _START_ to _END_ of _TOTAL_ tasks",

                    infoEmpty:
                        "Showing 0 to 0 of 0 tasks",

                    emptyTable:
                        "No tasks available"

                }

            }
        );


        // ========================================
        // CLEANUP
        // ========================================

        return () => {

            if (dataTableRef.current) {

                dataTableRef.current.destroy();

                dataTableRef.current = null;

            }

        };

    }, [tasks, loading, error]);


    // ========================================
    // REFRESH TASKS
    // ========================================

    const fetchTasks = async () => {

        try {

            setLoading(true);
            setError("");


            const response = await axios.get(
                GET_TASKS_URL,
                {
                    withCredentials: true
                }
            );


            const data = response.data;


            if (!data.success) {

                setError(
                    data.message ||
                    "Failed to load tasks."
                );

                return;
            }


            setTasks(
                Array.isArray(data.tasks)
                    ? [...data.tasks].sort(
                        (a, b) =>
                            Number(a.id) - Number(b.id)
                    )
                    : []
            );

        } catch (error) {

            console.error(
                "Get tasks error:",
                error
            );


            setError(
                "Unable to load tasks. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    // ========================================
    // FORMAT DEADLINE
    // ========================================

    const formatDeadline = (deadline) => {

        if (!deadline) {

            return "-";

        }


        const date = new Date(
            deadline.replace(" ", "T")
        );


        if (isNaN(date.getTime())) {

            return deadline;

        }


        return date.toLocaleString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    };


    // ========================================
    // FORMAT CREATED DATE
    // ========================================

    const formatCreatedDate = (createdAt) => {

        if (!createdAt) {

            return "-";

        }


        const date = new Date(
            createdAt.replace(" ", "T")
        );


        if (isNaN(date.getTime())) {

            return createdAt;

        }


        return date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    };


    // ========================================
    // GET TASK STATUS
    // ========================================

    const getTaskStatus = (deadline) => {

        if (!deadline) {

            return "Unknown";

        }


        const deadlineDate = new Date(
            deadline.replace(" ", "T")
        );


        if (
            isNaN(deadlineDate.getTime())
        ) {

            return "Unknown";

        }


        if (
            deadlineDate.getTime() <
            new Date().getTime()
        ) {

            return "Closed";

        }


        return "Active";

    };


    // ========================================
    // ADD TASK
    // ========================================

    const handleAddTask = () => {

        navigate("/admin/tasks/add");

    };


    // ========================================
    // VIEW TASK
    // ========================================

    const handleViewTask = (id) => {

        navigate(
            `/admin/tasks/${id}`
        );

    };


    // ========================================
    // EDIT TASK
    // ========================================

    const handleEditTask = (id) => {

        navigate(
            `/admin/tasks/${id}/edit`
        );

    };


    // ========================================
    // OPEN DELETE CONFIRMATION
    // ========================================

    const handleDeleteClick = (task) => {

        setDeleteSuccess("");
        setDeleteTask(task);

    };


    // ========================================
    // CLOSE DELETE CONFIRMATION
    // ========================================

    const handleCancelDelete = () => {

        if (deleting) {

            return;

        }

        setDeleteTask(null);

    };


    // ========================================
    // DELETE TASK
    // ========================================

    const handleDeleteTask = async () => {

        if (!deleteTask) {

            return;

        }


        try {

            setDeleting(true);
            setError("");
            setDeleteSuccess("");


            const response = await axios.post(
                DELETE_TASK_URL,
                {
                    id: Number(deleteTask.id)
                },
                {
                    withCredentials: true,

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


            const data = response.data;


            console.log(
                "Delete Task Response:",
                data
            );


            // ========================================
            // CHECK RESPONSE
            // ========================================

            if (!data.success) {

                setError(
                    data.message ||
                    "Failed to delete task."
                );

                return;

            }


            // ========================================
            // REMOVE TASK
            // ========================================

            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) =>
                        Number(task.id) !==
                        Number(deleteTask.id)
                )
            );


            // ========================================
            // CLOSE MODAL
            // ========================================

            setDeleteTask(null);


            // ========================================
            // SUCCESS MESSAGE
            // ========================================

            setDeleteSuccess(
                "Task deleted successfully."
            );


            setTimeout(() => {

                setDeleteSuccess("");

            }, 3000);


        } catch (error) {

            console.error(
                "Delete Task Error:",
                error
            );


            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {

                setError(
                    error.response.data.message
                );

            } else {

                setError(
                    "Unable to delete task. Please try again."
                );

            }

        } finally {

            setDeleting(false);

        }

    };


    // ========================================
    // LOADING
    // ========================================

    if (loading && !user) {

        return (

            <div className="admin-layout">

                <AdminSidebar />

                <div className="admin-main">

                    <AdminNavbar />

                    <main className="admin-content">

                        <div className="add-task-loading">

                            <div
                                className="spinner-border"
                                role="status"
                            >

                                <span className="visually-hidden">
                                    Loading...
                                </span>

                            </div>

                        </div>

                    </main>

                </div>

            </div>

        );

    }


    // ========================================
    // PAGE
    // ========================================

    return (

        <div className="admin-layout">

            <AdminSidebar />


            <div className="admin-main admin-tasks-page">

                <AdminNavbar user={user} />


                <main className="admin-content">


                    {/* ========================================
                        DELETE SUCCESS MESSAGE
                    ======================================== */}

                    {deleteSuccess && (

                        <div className="alert alert-success tasks-delete-success">

                            <i className="bi bi-check-circle me-2"></i>

                            {deleteSuccess}

                        </div>

                    )}


                    {/* ========================================
                        PAGE HEADER
                    ======================================== */}

                    <div className="tasks-page-header">

                        <div>

                            <h2 className="tasks-title">
                                Tasks
                            </h2>

                            <p className="tasks-subtitle">
                                Manage tasks created for students
                            </p>

                        </div>


                        <button
                            type="button"
                            className="btn btn-primary tasks-add-button"
                            onClick={handleAddTask}
                        >

                            <i className="bi bi-plus-lg me-2"></i>

                            Add New Task

                        </button>

                    </div>


                    {/* ========================================
                        SUMMARY CARDS
                    ======================================== */}

                    <div className="row g-3 mb-4">


                        {/* TOTAL */}

                        <div className="col-md-4">

                            <div className="task-summary-card">

                                <div className="task-summary-icon">

                                    <i className="bi bi-list-task"></i>

                                </div>


                                <div>

                                    <div className="task-summary-label">
                                        Total Tasks
                                    </div>

                                    <div className="task-summary-number">
                                        {tasks.length}
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ACTIVE */}

                        <div className="col-md-4">

                            <div className="task-summary-card">

                                <div className="task-summary-icon">

                                    <i className="bi bi-clock"></i>

                                </div>


                                <div>

                                    <div className="task-summary-label">
                                        Active Tasks
                                    </div>

                                    <div className="task-summary-number">

                                        {
                                            tasks.filter(
                                                (task) =>
                                                    getTaskStatus(
                                                        task.deadline
                                                    ) === "Active"
                                            ).length
                                        }

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* CLOSED */}

                        <div className="col-md-4">

                            <div className="task-summary-card">

                                <div className="task-summary-icon">

                                    <i className="bi bi-check-circle"></i>

                                </div>


                                <div>

                                    <div className="task-summary-label">
                                        Closed Tasks
                                    </div>

                                    <div className="task-summary-number">

                                        {
                                            tasks.filter(
                                                (task) =>
                                                    getTaskStatus(
                                                        task.deadline
                                                    ) === "Closed"
                                            ).length
                                        }

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ========================================
                        TASK LIST CARD
                    ======================================== */}

                    <div className="tasks-card">


                        <div className="tasks-card-header">

                            <div>

                                <h5 className="tasks-card-title">
                                    Task List
                                </h5>

                                <p className="tasks-card-description">
                                    View and manage all tasks created for students.
                                </p>

                            </div>

                        </div>


                        {/* ========================================
                            ERROR
                        ======================================== */}

                        {error && (

                            <div className="p-4">

                                <div className="alert alert-danger mb-3">

                                    <i className="bi bi-exclamation-circle me-2"></i>

                                    {error}

                                </div>


                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={fetchTasks}
                                >

                                    <i className="bi bi-arrow-clockwise me-2"></i>

                                    Try Again

                                </button>

                            </div>

                        )}


                        {/* ========================================
                            LOADING
                        ======================================== */}

                        {loading && !error && (

                            <div className="text-center py-5">

                                <div
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                ></div>

                                Loading tasks...

                            </div>

                        )}


                        {/* ========================================
                            NO TASKS
                        ======================================== */}

                        {!loading &&
                            !error &&
                            tasks.length === 0 && (

                                <div className="text-center py-5">

                                    <div className="empty-task-icon">

                                        <i className="bi bi-clipboard-x"></i>

                                    </div>


                                    <h6 className="mt-3">
                                        No Tasks Yet
                                    </h6>


                                    <p className="text-muted mb-3">
                                        You haven't created any tasks yet.
                                    </p>


                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={handleAddTask}
                                    >

                                        <i className="bi bi-plus-lg me-2"></i>

                                        Create Your First Task

                                    </button>

                                </div>

                            )}


                        {/* ========================================
                            DATATABLE
                        ======================================== */}

                        {!loading &&
                            !error &&
                            tasks.length > 0 && (

                                <div className="tasks-table-wrapper">

                                    <table
                                        ref={tableRef}
                                        className="table table-hover align-middle tasks-table"
                                        style={{
                                            width: "100%"
                                        }}
                                    >

                                        <thead>

                                            <tr>

                                                <th>
                                                    #
                                                </th>

                                                <th>
                                                    Task
                                                </th>

                                                <th>
                                                    Deadline
                                                </th>

                                                <th>
                                                    Max Score
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Created
                                                </th>

                                                <th className="text-center">
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {tasks.map(
                                                (task, index) => {

                                                    const status =
                                                        getTaskStatus(
                                                            task.deadline
                                                        );


                                                    return (

                                                        <tr
                                                            key={task.id}
                                                        >

                                                            {/* NUMBER */}

                                                            <td className="task-number">
                                                                {index + 1}
                                                            </td>


                                                            {/* TASK */}

                                                            <td>

                                                                <div className="task-name">
                                                                    {task.title}
                                                                </div>


                                                                {task.description && (

                                                                    <div className="task-description">
                                                                        {task.description}
                                                                    </div>

                                                                )}

                                                            </td>


                                                            {/* DEADLINE */}

                                                            <td>

                                                                <div className="task-deadline">

                                                                    <i className="bi bi-calendar3 me-1"></i>

                                                                    {formatDeadline(
                                                                        task.deadline
                                                                    )}

                                                                </div>

                                                            </td>


                                                            {/* MAX SCORE */}

                                                            <td>

                                                                <span className="task-score">

                                                                    {task.max_score}

                                                                </span>

                                                            </td>


                                                            {/* STATUS */}

                                                            <td>

                                                                <span
                                                                    className={
                                                                        status === "Active"
                                                                            ? "task-status active"
                                                                            : "task-status closed"
                                                                    }
                                                                >

                                                                    <span className="status-dot"></span>

                                                                    {status}

                                                                </span>

                                                            </td>


                                                            {/* CREATED */}

                                                            <td>

                                                                <div className="task-created-date">

                                                                    <i className="bi bi-calendar3 me-1"></i>

                                                                    {formatCreatedDate(
                                                                        task.created_at
                                                                    )}

                                                                </div>

                                                            </td>


                                                            {/* ACTION */}

                                                            <td>

                                                                <div className="task-action-buttons">


                                                                    {/* VIEW */}

                                                                    <button
                                                                        type="button"
                                                                        className="task-action-icon view"
                                                                        onClick={() =>
                                                                            handleViewTask(
                                                                                task.id
                                                                            )
                                                                        }
                                                                        title="View task details"
                                                                        aria-label="View task details"
                                                                    >

                                                                        <i className="bi bi-eye"></i>

                                                                    </button>


                                                                    {/* EDIT */}

                                                                    <button
                                                                        type="button"
                                                                        className="task-action-icon edit"
                                                                        onClick={() =>
                                                                            handleEditTask(
                                                                                task.id
                                                                            )
                                                                        }
                                                                        title="Edit task"
                                                                        aria-label="Edit task"
                                                                    >

                                                                        <i className="bi bi-pencil"></i>

                                                                    </button>


                                                                    {/* DELETE */}

                                                                    <button
                                                                        type="button"
                                                                        className="task-action-icon delete"
                                                                        onClick={() =>
                                                                            handleDeleteClick(
                                                                                task
                                                                            )
                                                                        }
                                                                        title="Delete task"
                                                                        aria-label="Delete task"
                                                                    >

                                                                        <i className="bi bi-trash"></i>

                                                                    </button>


                                                                </div>

                                                            </td>

                                                        </tr>

                                                    );

                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                    </div>

                </main>


                {/* ========================================
                    DELETE CONFIRMATION MODAL
                ======================================== */}

                {deleteTask && (

                    <div
                        className="delete-task-overlay"
                        onClick={handleCancelDelete}
                    >

                        <div
                            className="delete-task-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >


                            {/* ICON */}

                            <div className="delete-task-icon">

                                <i className="bi bi-trash3"></i>

                            </div>


                            {/* TITLE */}

                            <h4>
                                Delete Task?
                            </h4>


                            {/* MESSAGE */}

                            <p className="delete-task-message">

                                Are you sure you want to delete this task?

                            </p>


                            {/* TASK NAME */}

                            <div className="delete-task-name">

                                <i className="bi bi-file-earmark-text me-2"></i>

                                <span>
                                    {deleteTask.title}
                                </span>

                            </div>


                            {/* WARNING */}

                            <p className="delete-task-warning">

                                <i className="bi bi-exclamation-triangle me-1"></i>

                                This action cannot be undone.

                            </p>


                            {/* ACTIONS */}

                            <div className="delete-task-actions">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleCancelDelete}
                                    disabled={deleting}
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteTask}
                                    disabled={deleting}
                                >

                                    {deleting ? (

                                        <>

                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>

                                            Deleting...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-trash me-2"></i>

                                            Delete Task

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}

export default AdminTasks;