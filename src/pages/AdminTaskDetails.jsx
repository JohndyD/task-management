import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

import "../css/TaskDetails.css";

const CHECK_SESSION_URL =
    "http://localhost/task-management/php/check_session.php";

const GET_TASK_URL =
    "http://localhost/task-management/php/admin/view_tasks.php";

function TaskDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [task, setTask] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Check Session
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const checkSession = async () => {

            try {

                const response = await axios.get(
                    CHECK_SESSION_URL,
                    {
                        withCredentials: true
                    }
                );

                if (
                    !response.data ||
                    !response.data.loggedIn
                ) {
                    navigate("/login");
                    return;
                }

                if (
                    !response.data.user ||
                    response.data.user.role !== "admin"
                ) {
                    navigate("/");
                    return;
                }

                setUser(response.data.user);

            } catch (err) {

                console.error(
                    "Session check error:",
                    err
                );

                navigate("/login");
            }
        };

        checkSession();

    }, [navigate]);


    /*
    |--------------------------------------------------------------------------
    | Load Task
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const fetchTask = async () => {

            if (!id) {
                setError("Invalid task ID.");
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError("");

                const response = await axios.get(
                    `${GET_TASK_URL}?id=${id}`,
                    {
                        withCredentials: true
                    }
                );

                if (
                    response.data &&
                    response.data.success
                ) {

                    setTask(response.data.task);

                } else {

                    setError(
                        response.data?.message ||
                        "Failed to load task."
                    );
                }

            } catch (err) {

                console.error(
                    "Fetch task error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Failed to load task details."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchTask();

    }, [id]);


    /*
    |--------------------------------------------------------------------------
    | Date Formatting
    |--------------------------------------------------------------------------
    */

    const formatDateTime = (dateString) => {

        if (!dateString) {
            return "—";
        }

        const date = new Date(
            dateString.replace(" ", "T")
        );

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }
        );
    };


    const formatDate = (dateString) => {

        if (!dateString) {
            return "—";
        }

        const date = new Date(
            dateString.replace(" ", "T")
        );

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Task Status
    |--------------------------------------------------------------------------
    */

    const isTaskActive = () => {

        if (!task?.deadline) {
            return false;
        }

        const deadline = new Date(
            task.deadline.replace(" ", "T")
        );

        return deadline.getTime() >= Date.now();
    };


    /*
    |--------------------------------------------------------------------------
    | Submission Settings
    |--------------------------------------------------------------------------
    */

    const getResubmissionText = () => {

        return Number(task?.allow_resubmission) === 1
            ? "Enabled"
            : "Not Allowed";
    };


    const getAttemptsText = () => {

        if (
            Number(task?.allow_resubmission) !== 1
        ) {
            return "Not Applicable";
        }

        if (
            task?.max_attempts === null ||
            task?.max_attempts === undefined ||
            task?.max_attempts === ""
        ) {
            return "Unlimited";
        }

        const attempts = Number(
            task.max_attempts
        );

        return `${attempts} ${attempts === 1
                ? "attempt"
                : "attempts"
            }`;
    };


    const getLateSubmissionText = () => {

        return Number(task?.allow_late_submission) === 1
            ? "Allowed"
            : "Not Allowed";
    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="admin-layout">

                <AdminSidebar />

                <div className="admin-main">

                    <AdminNavbar user={user} />

                    <main className="task-details-page">

                        <div className="task-details-loading">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                            <p>
                                Loading task details...
                            </p>

                        </div>

                    </main>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error || !task) {

        return (
            <div className="admin-layout">

                <AdminSidebar />

                <div className="admin-main">

                    <AdminNavbar user={user} />

                    <main className="task-details-page">

                        <div className="task-details-error">

                            <div className="task-error-icon">
                                <i className="bi bi-exclamation-circle"></i>
                            </div>

                            <h5>
                                Unable to Load Task
                            </h5>

                            <p>
                                {error ||
                                    "The requested task could not be found."}
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate("/admin/tasks")
                                }
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Tasks
                            </button>

                        </div>

                    </main>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Main
    |--------------------------------------------------------------------------
    */

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main">

                <AdminNavbar user={user} />

                <main className="task-details-page">

                    {/* PAGE HEADER */}

                    <div className="task-details-header">

                        <div>

                            <div className="task-details-breadcrumb">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/admin/tasks")
                                    }
                                >
                                    Tasks
                                </button>

                                <i className="bi bi-chevron-right"></i>

                                <span>
                                    Task Details
                                </span>

                            </div>

                            <h1>
                                Task Details
                            </h1>

                        </div>

                    </div>


                    {/* TASK CARD */}

                    <div className="task-details-card">

                        {/* TASK TITLE */}

                        <div className="task-details-title-section">

                            <div className="task-title-content">

                                <h2>
                                    {task.title}
                                </h2>

                                <span
                                    className={
                                        isTaskActive()
                                            ? "task-status-badge active"
                                            : "task-status-badge closed"
                                    }
                                >

                                    <span className="status-dot"></span>

                                    {isTaskActive()
                                        ? "Active"
                                        : "Closed"}

                                </span>

                            </div>

                            <p className="task-description">

                                {task.description
                                    ? task.description
                                    : "No description provided."}

                            </p>

                        </div>


                        {/* BASIC DETAILS */}

                        <div className="task-details-section">

                            <div className="task-info-grid">

                                {/* DEADLINE */}

                                <div className="task-info-item">

                                    <div className="task-info-icon">
                                        <i className="bi bi-calendar-event"></i>
                                    </div>

                                    <div>

                                        <span className="task-info-label">
                                            Deadline
                                        </span>

                                        <span className="task-info-value">
                                            {formatDateTime(
                                                task.deadline
                                            )}
                                        </span>

                                    </div>

                                </div>


                                {/* MAX SCORE */}

                                <div className="task-info-item">

                                    <div className="task-info-icon">
                                        <i className="bi bi-award"></i>
                                    </div>

                                    <div>

                                        <span className="task-info-label">
                                            Maximum Score
                                        </span>

                                        <span className="task-info-value">
                                            {task.max_score} points
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* SUBMISSION SETTINGS */}

                        <div className="task-details-section">

                            <div className="task-section-heading">

                                <i className="bi bi-upload"></i>

                                <h3>
                                    Submission Settings
                                </h3>

                            </div>

                            <div className="submission-settings-grid">

                                {/* RESUBMISSION */}

                                <div className="submission-setting">

                                    <span className="setting-label">
                                        Resubmissions
                                    </span>

                                    <span
                                        className={
                                            Number(task.allow_resubmission) === 1
                                                ? "setting-value enabled"
                                                : "setting-value disabled"
                                        }
                                    >
                                        {getResubmissionText()}
                                    </span>

                                </div>


                                {/* MAX ATTEMPTS */}

                                <div className="submission-setting">

                                    <span className="setting-label">
                                        Maximum Attempts
                                    </span>

                                    <span className="setting-value">

                                        {getAttemptsText()}

                                    </span>

                                </div>


                                {/* LATE SUBMISSION */}

                                <div className="submission-setting">

                                    <span className="setting-label">
                                        Late Submission
                                    </span>

                                    <span
                                        className={
                                            Number(task.allow_late_submission) === 1
                                                ? "setting-value enabled"
                                                : "setting-value disabled"
                                        }
                                    >
                                        {getLateSubmissionText()}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* TASK INFORMATION */}

                        <div className="task-details-section">

                            <div className="task-section-heading">

                                <i className="bi bi-info-circle"></i>

                                <h3>
                                    Task Information
                                </h3>

                            </div>

                            <div className="task-information-grid">

                                <div className="task-information-item">

                                    <span className="information-label">
                                        Created By
                                    </span>

                                    <span className="information-value">
                                        {task.created_by_name ||
                                            "Unknown"}
                                    </span>

                                </div>


                                <div className="task-information-item">

                                    <span className="information-label">
                                        Created Date
                                    </span>

                                    <span className="information-value">
                                        {formatDate(
                                            task.created_at
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="task-details-actions">

                            <button
                                type="button"
                                className="btn btn-light task-back-button"
                                onClick={() =>
                                    navigate("/admin/tasks")
                                }
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Tasks
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary task-edit-button"
                                onClick={() =>
                                    navigate(
                                        `/admin/tasks/${task.id}/edit`
                                    )
                                }
                            >
                                <i className="bi bi-pencil me-2"></i>
                                Edit Task
                            </button>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}

export default TaskDetails;