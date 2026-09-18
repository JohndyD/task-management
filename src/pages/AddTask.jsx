import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

import "../css/AddTask.css";


const CHECK_SESSION_URL =
    "http://localhost/task-management/php/check_session.php";

const ADD_TASK_URL =
    "http://localhost/task-management/php/admin/add_task.php";


function AddTask() {

    const navigate = useNavigate();


    // ========================================
    // USER
    // ========================================

    const [user, setUser] = useState(null);


    // ========================================
    // TASK INFORMATION
    // ========================================

    const [title, setTitle] = useState("");

    const [description, setDescription] =
        useState("");

    const [deadline, setDeadline] =
        useState("");

    const [maxScore, setMaxScore] =
        useState("100");


    // ========================================
    // SUBMISSION SETTINGS
    // ========================================

    const [allowResubmission, setAllowResubmission] =
        useState(true);

    const [maxAttempts, setMaxAttempts] =
        useState("");

    const [allowLateSubmission, setAllowLateSubmission] =
        useState(false);


    // ========================================
    // PAGE STATE
    // ========================================

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ========================================
    // CHECK SESSION
    // ========================================

    useEffect(() => {

        const checkSession = async () => {

            try {

                const response =
                    await axios.get(
                        CHECK_SESSION_URL,
                        {
                            withCredentials: true
                        }
                    );


                const data =
                    response.data;


                // ========================================
                // NOT LOGGED IN
                // ========================================

                if (
                    !data.success ||
                    !data.loggedIn
                ) {

                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );

                    return;
                }


                // ========================================
                // CHECK ADMIN
                // ========================================

                if (
                    !data.user ||
                    data.user.role !== "admin"
                ) {

                    navigate(
                        "/student",
                        {
                            replace: true
                        }
                    );

                    return;
                }


                setUser(
                    data.user
                );

            } catch (error) {

                console.error(
                    "Session Error:",
                    error
                );


                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

            } finally {

                setLoading(false);

            }

        };


        checkSession();

    }, [navigate]);


    // ========================================
    // HANDLE SUBMIT
    // ========================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        setError("");
        setSuccess("");


        // ========================================
        // VALIDATE TITLE
        // ========================================

        if (!title.trim()) {

            setError(
                "Please enter a task title."
            );

            return;
        }


        // ========================================
        // VALIDATE DEADLINE
        // ========================================

        if (!deadline) {

            setError(
                "Please select a deadline."
            );

            return;
        }


        const deadlineDate =
            new Date(
                deadline
            );


        if (
            isNaN(
                deadlineDate.getTime()
            )
        ) {

            setError(
                "Please enter a valid deadline."
            );

            return;
        }


        if (
            deadlineDate <= new Date()
        ) {

            setError(
                "The deadline must be in the future."
            );

            return;
        }


        // ========================================
        // VALIDATE MAX SCORE
        // ========================================

        const score =
            Number(maxScore);


        if (
            !Number.isInteger(score) ||
            score <= 0
        ) {

            setError(
                "Maximum score must be greater than 0."
            );

            return;
        }


        // ========================================
        // VALIDATE MAX ATTEMPTS
        // ========================================

        let attempts = null;


        if (allowResubmission) {

            if (
                maxAttempts !== ""
            ) {

                attempts =
                    Number(maxAttempts);


                if (
                    !Number.isInteger(attempts) ||
                    attempts < 2
                ) {

                    setError(
                        "Maximum attempts must be at least 2, or leave it blank for unlimited attempts."
                    );

                    return;
                }

            }

        }


        setSaving(true);


        try {

            const response =
                await axios.post(
                    ADD_TASK_URL,
                    {
                        title:
                            title.trim(),

                        description:
                            description.trim(),

                        deadline:
                            deadline,

                        max_score:
                            score,

                        allow_resubmission:
                            allowResubmission
                                ? 1
                                : 0,

                        max_attempts:
                            allowResubmission
                                ? attempts
                                : 1,

                        allow_late_submission:
                            allowLateSubmission
                                ? 1
                                : 0
                    },
                    {
                        withCredentials: true,

                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            const data =
                response.data;


            console.log(
                "Add Task Response:",
                data
            );


            // ========================================
            // CHECK RESPONSE
            // ========================================

            if (!data.success) {

                setError(
                    data.message ||
                    "Failed to create task."
                );

                return;
            }


            // ========================================
            // SUCCESS
            // ========================================

            setSuccess(
                "Task created successfully."
            );


            // ========================================
            // RETURN TO TASK LIST
            // ========================================

            setTimeout(() => {

                navigate(
                    "/admin/tasks"
                );

            }, 1000);

        } catch (error) {

            console.error(
                "Add Task Error:",
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
                    "Unable to create task. Please try again."
                );

            }

        } finally {

            setSaving(false);

        }

    };


    // ========================================
    // CANCEL
    // ========================================

    const handleCancel = () => {

        navigate(
            "/admin/tasks"
        );

    };


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (

            <div className="admin-layout">

                <AdminSidebar />


                <div className="admin-main">

                    <AdminNavbar
                        user={user}
                    />


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


            <div className="admin-main">

                <AdminNavbar
                    user={user}
                />


                <main className="admin-content">


                    {/* ========================================
                        PAGE HEADER
                    ======================================== */}

                    <div className="add-task-page-header">

                        <div>

                            <div className="add-task-back">

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                >

                                    <i className="bi bi-arrow-left me-2"></i>

                                    Back to Tasks

                                </button>

                            </div>


                            <h2 className="add-task-title">
                                Add New Task
                            </h2>


                            <p className="add-task-subtitle">
                                Create a new task for students.
                            </p>

                        </div>

                    </div>


                    {/* ========================================
                        ERROR
                    ======================================== */}

                    {error && (

                        <div className="alert alert-danger add-task-alert">

                            <i className="bi bi-exclamation-circle me-2"></i>

                            {error}

                        </div>

                    )}


                    {/* ========================================
                        SUCCESS
                    ======================================== */}

                    {success && (

                        <div className="alert alert-success add-task-alert">

                            <i className="bi bi-check-circle me-2"></i>

                            {success}

                        </div>

                    )}


                    {/* ========================================
                        FORM CARD
                    ======================================== */}

                    <div className="add-task-card">


                        {/* ========================================
                            FORM HEADER
                        ======================================== */}

                        <div className="add-task-form-header">

                            <div className="add-task-form-icon">

                                <i className="bi bi-plus-lg"></i>

                            </div>


                            <div>

                                <h4>
                                    Task Information
                                </h4>

                                <p>
                                    Enter the details and submission rules for the new task.
                                </p>

                            </div>

                        </div>


                        <form onSubmit={handleSubmit}>


                            {/* ========================================
                                BASIC INFORMATION
                            ======================================== */}

                            <div className="add-task-section">

                                <div className="add-task-section-title">

                                    <i className="bi bi-info-circle"></i>

                                    <span>
                                        Information
                                    </span>

                                </div>


                                {/* TASK TITLE */}

                                <div className="mb-4">

                                    <label
                                        htmlFor="taskTitle"
                                        className="form-label fw-semibold"
                                    >

                                        Task Title

                                        <span className="text-danger ms-1">
                                            *
                                        </span>

                                    </label>


                                    <input
                                        id="taskTitle"
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(event) =>
                                            setTitle(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter task title"
                                        maxLength={255}
                                        disabled={saving}
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div>

                                    <label
                                        htmlFor="taskDescription"
                                        className="form-label fw-semibold"
                                    >

                                        Description

                                    </label>


                                    <textarea
                                        id="taskDescription"
                                        className="form-control add-task-description"
                                        value={description}
                                        onChange={(event) =>
                                            setDescription(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter a description or instructions for this task..."
                                        rows="6"
                                        disabled={saving}
                                    />

                                </div>

                            </div>


                            {/* ========================================
                                TASK SETTINGS
                            ======================================== */}

                            <div className="add-task-section">

                                <div className="add-task-section-title">

                                    <i className="bi bi-sliders"></i>

                                    <span>
                                        Task Settings
                                    </span>

                                </div>


                                <div className="row g-4">


                                    {/* DEADLINE */}

                                    <div className="col-md-7">

                                        <label
                                            htmlFor="taskDeadline"
                                            className="form-label fw-semibold"
                                        >

                                            <i className="bi bi-calendar-event me-2"></i>

                                            Deadline

                                            <span className="text-danger ms-1">
                                                *
                                            </span>

                                        </label>


                                        <input
                                            id="taskDeadline"
                                            type="datetime-local"
                                            className="form-control"
                                            value={deadline}
                                            onChange={(event) =>
                                                setDeadline(
                                                    event.target.value
                                                )
                                            }
                                            disabled={saving}
                                        />

                                    </div>


                                    {/* MAX SCORE */}

                                    <div className="col-md-5">

                                        <label
                                            htmlFor="taskMaxScore"
                                            className="form-label fw-semibold"
                                        >

                                            <i className="bi bi-award me-2"></i>

                                            Maximum Score

                                            <span className="text-danger ms-1">
                                                *
                                            </span>

                                        </label>


                                        <input
                                            id="taskMaxScore"
                                            type="number"
                                            className="form-control"
                                            value={maxScore}
                                            onChange={(event) =>
                                                setMaxScore(
                                                    event.target.value
                                                )
                                            }
                                            min="1"
                                            step="1"
                                            disabled={saving}
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* ========================================
                                SUBMISSION SETTINGS
                            ======================================== */}

                            <div className="add-task-section">

                                <div className="add-task-section-title">

                                    <i className="bi bi-upload"></i>

                                    <span>
                                        Submission Settings
                                    </span>

                                </div>


                                {/* ALLOW RESUBMISSION */}

                                <div className="add-task-setting-row">

                                    <div className="add-task-setting-info">

                                        <div className="add-task-setting-title">

                                            <i className="bi bi-arrow-repeat me-2"></i>

                                            Allow Resubmissions

                                        </div>

                                        <div className="add-task-setting-description">

                                            Allow students to replace their current submission before the deadline.

                                        </div>

                                    </div>


                                    <div className="form-check form-switch">

                                        <input
                                            id="allowResubmission"
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={allowResubmission}
                                            onChange={(event) => {

                                                const checked =
                                                    event.target.checked;

                                                setAllowResubmission(
                                                    checked
                                                );


                                                if (!checked) {

                                                    setMaxAttempts(
                                                        "1"
                                                    );

                                                } else {

                                                    setMaxAttempts(
                                                        ""
                                                    );

                                                }

                                            }}
                                            disabled={saving}
                                        />

                                        <label
                                            htmlFor="allowResubmission"
                                            className="form-check-label"
                                        >

                                            {allowResubmission
                                                ? "Allowed"
                                                : "Not allowed"
                                            }

                                        </label>

                                    </div>

                                </div>


                                {/* MAX ATTEMPTS */}

                                <div className="add-task-setting-row">

                                    <div className="add-task-setting-info">

                                        <div className="add-task-setting-title">

                                            <i className="bi bi-123 me-2"></i>

                                            Maximum Attempts

                                        </div>

                                        <div className="add-task-setting-description">

                                            Set how many times a student can submit. Leave blank for unlimited attempts.

                                        </div>

                                    </div>


                                    <div className="add-task-setting-control">

                                        <input
                                            id="maxAttempts"
                                            type="number"
                                            className="form-control"
                                            value={
                                                allowResubmission
                                                    ? maxAttempts
                                                    : "1"
                                            }
                                            onChange={(event) =>
                                                setMaxAttempts(
                                                    event.target.value
                                                )
                                            }
                                            min="2"
                                            step="1"
                                            placeholder="Unlimited"
                                            disabled={
                                                saving ||
                                                !allowResubmission
                                            }
                                        />

                                        {!allowResubmission && (

                                            <small className="text-muted">
                                                Resubmissions are disabled.
                                            </small>

                                        )}

                                    </div>

                                </div>


                                {/* ALLOW LATE SUBMISSION */}

                                <div className="add-task-setting-row">

                                    <div className="add-task-setting-info">

                                        <div className="add-task-setting-title">

                                            <i className="bi bi-clock-history me-2"></i>

                                            Allow Late Submissions

                                        </div>

                                        <div className="add-task-setting-description">

                                            Allow students to submit after the deadline.

                                        </div>

                                    </div>


                                    <div className="form-check form-switch">

                                        <input
                                            id="allowLateSubmission"
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={allowLateSubmission}
                                            onChange={(event) =>
                                                setAllowLateSubmission(
                                                    event.target.checked
                                                )
                                            }
                                            disabled={saving}
                                        />

                                        <label
                                            htmlFor="allowLateSubmission"
                                            className="form-check-label"
                                        >

                                            {allowLateSubmission
                                                ? "Allowed"
                                                : "Not allowed"
                                            }

                                        </label>

                                    </div>

                                </div>

                            </div>


                            {/* ========================================
                                ACTION BUTTONS
                            ======================================== */}

                            <div className="add-task-actions">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary add-cancel-btn"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >

                                    <i className="bi bi-x-lg me-2"></i>

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary add-save-btn"
                                    disabled={saving}
                                >

                                    {saving ? (

                                        <>

                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>

                                            Creating...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-check-lg me-2"></i>

                                            Create Task

                                        </>

                                    )}

                                </button>

                            </div>


                        </form>

                    </div>

                </main>

            </div>

        </div>

    );

}


export default AddTask;