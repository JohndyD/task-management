import { useEffect, useState } from "react";
import axios from "axios";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

import "../css/EditTask.css";


const CHECK_SESSION_URL =
    "http://localhost/task-management/php/check_session.php";

const GET_TASKS_URL =
    "http://localhost/task-management/php/admin/get_tasks.php";

const EDIT_TASK_URL =
    "http://localhost/task-management/php/admin/edit_task.php";


function EditTask() {

    const navigate = useNavigate();

    const { id } = useParams();


    // ========================================
    // USER / PAGE STATE
    // ========================================

    const [user, setUser] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ========================================
    // TASK INFORMATION
    // ========================================

    const [title, setTitle] =
        useState("");

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
    // LOAD SESSION + TASK
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

                const sessionResponse =
                    await axios.get(
                        CHECK_SESSION_URL,
                        {
                            withCredentials: true
                        }
                    );


                const sessionData =
                    sessionResponse.data;


                if (
                    !sessionData.success ||
                    !sessionData.loggedIn
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
                // CHECK ADMIN ROLE
                // ========================================

                if (
                    !sessionData.user ||
                    sessionData.user.role !== "admin"
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
                // SAVE USER
                // ========================================

                if (mounted) {

                    setUser(
                        sessionData.user
                    );

                }


                // ========================================
                // CHECK TASK ID
                // ========================================

                if (!id) {

                    if (mounted) {

                        setError(
                            "No task ID was provided."
                        );

                    }

                    return;
                }


                // ========================================
                // GET TASKS
                // ========================================

                const tasksResponse =
                    await axios.get(
                        GET_TASKS_URL,
                        {
                            withCredentials: true
                        }
                    );


                const tasksData =
                    tasksResponse.data;


                console.log(
                    "Get Tasks Response:",
                    tasksData
                );


                // ========================================
                // CHECK RESPONSE
                // ========================================

                if (
                    !tasksData ||
                    !tasksData.success
                ) {

                    if (mounted) {

                        setError(
                            tasksData?.message ||
                            "Failed to load tasks."
                        );

                    }

                    return;
                }


                // ========================================
                // CHECK TASK ARRAY
                // ========================================

                if (
                    !Array.isArray(
                        tasksData.tasks
                    )
                ) {

                    if (mounted) {

                        setError(
                            "Invalid task data received from server."
                        );

                    }

                    return;
                }


                // ========================================
                // FIND TASK
                // ========================================

                const task =
                    tasksData.tasks.find(
                        (item) =>
                            Number(item.id) ===
                            Number(id)
                    );


                console.log(
                    "Selected Task:",
                    task
                );


                // ========================================
                // TASK NOT FOUND
                // ========================================

                if (!task) {

                    if (mounted) {

                        setError(
                            "Task not found."
                        );

                    }

                    return;
                }


                // ========================================
                // LOAD TASK INFORMATION
                // ========================================

                if (mounted) {

                    // ========================================
                    // TITLE
                    // ========================================

                    setTitle(
                        task.title ?? ""
                    );


                    // ========================================
                    // DESCRIPTION
                    // ========================================

                    setDescription(
                        task.description ?? ""
                    );


                    // ========================================
                    // DEADLINE
                    // ========================================

                    if (task.deadline) {

                        setDeadline(
                            String(
                                task.deadline
                            )
                                .replace(
                                    " ",
                                    "T"
                                )
                                .slice(
                                    0,
                                    16
                                )
                        );

                    } else {

                        setDeadline("");

                    }


                    // ========================================
                    // MAX SCORE
                    // ========================================

                    setMaxScore(
                        String(
                            task.max_score ??
                            100
                        )
                    );


                    // ========================================
                    // ALLOW RESUBMISSION
                    // ========================================

                    const resubmissionAllowed =
                        task.allow_resubmission === 1 ||
                        task.allow_resubmission === "1" ||
                        task.allow_resubmission === true;


                    setAllowResubmission(
                        resubmissionAllowed
                    );


                    // ========================================
                    // MAX ATTEMPTS
                    // ========================================

                    if (
                        task.max_attempts !== null &&
                        task.max_attempts !== undefined &&
                        task.max_attempts !== "" &&
                        Number(task.max_attempts) > 1
                    ) {

                        setMaxAttempts(
                            String(
                                task.max_attempts
                            )
                        );

                    } else {

                        setMaxAttempts("");

                    }


                    // ========================================
                    // ALLOW LATE SUBMISSION
                    // ========================================

                    const lateAllowed =
                        task.allow_late_submission === 1 ||
                        task.allow_late_submission === "1" ||
                        task.allow_late_submission === true;


                    setAllowLateSubmission(
                        lateAllowed
                    );

                }

            } catch (error) {

                console.error(
                    "Edit Task Load Error:",
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
                        "Unable to load task. Please try again."
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

    }, [id, navigate]);


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
                "Task title is required."
            );

            return;
        }


        // ========================================
        // VALIDATE DEADLINE
        // ========================================

        if (!deadline) {

            setError(
                "Deadline is required."
            );

            return;
        }


        // ========================================
        // VALIDATE SCORE
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
        // VALIDATE ATTEMPTS
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

        } else {

            attempts = 1;

        }


        try {

            setSaving(true);


            // ========================================
            // UPDATE TASK
            // ========================================

            const response =
                await axios.post(
                    EDIT_TASK_URL,
                    {
                        id:
                            Number(id),

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
                            attempts,

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
                "Edit Task Response:",
                data
            );


            // ========================================
            // CHECK RESPONSE
            // ========================================

            if (!data.success) {

                setError(
                    data.message ||
                    "Failed to update task."
                );

                return;
            }


            // ========================================
            // SUCCESS
            // ========================================

            setSuccess(
                "Task updated successfully."
            );


            setTimeout(() => {

                navigate(
                    "/admin/tasks"
                );

            }, 800);

        } catch (error) {

            console.error(
                "Edit Task Error:",
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
                    "Unable to update task. Please try again."
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

                        <div className="edit-task-loading">

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

                    <div className="edit-task-page-header">

                        <div>

                            <div className="edit-task-back">

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                >

                                    <i className="bi bi-arrow-left me-2"></i>

                                    Back to Tasks

                                </button>

                            </div>


                            <h2 className="edit-task-title">
                                Edit Task
                            </h2>


                            <p className="edit-task-subtitle">
                                Update the task information and submission rules.
                            </p>

                        </div>

                    </div>


                    {/* ========================================
                        ERROR
                    ======================================== */}

                    {error && (

                        <div className="alert alert-danger">

                            <i className="bi bi-exclamation-circle me-2"></i>

                            {error}

                        </div>

                    )}


                    {/* ========================================
                        SUCCESS
                    ======================================== */}

                    {success && (

                        <div className="alert alert-success">

                            <i className="bi bi-check-circle me-2"></i>

                            {success}

                        </div>

                    )}


                    {/* ========================================
                        FORM CARD
                    ======================================== */}

                    <div className="edit-task-card">


                        {/* FORM HEADER */}

                        <div className="edit-task-form-header">

                            <div className="edit-task-form-icon">

                                <i className="bi bi-pencil-square"></i>

                            </div>


                            <div>

                                <h4>
                                    Task Information
                                </h4>

                                <p>
                                    Update the details and submission rules for this task.
                                </p>

                            </div>

                        </div>


                        <form onSubmit={handleSubmit}>


                            {/* ========================================
                                BASIC INFORMATION
                            ======================================== */}

                            <div className="edit-task-section">

                                <div className="edit-task-section-title">

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
                                        className="form-control edit-task-description"
                                        value={description}
                                        onChange={(event) =>
                                            setDescription(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter a description for this task..."
                                        rows="6"
                                        disabled={saving}
                                    />

                                </div>

                            </div>


                            {/* ========================================
                                TASK SETTINGS
                            ======================================== */}

                            <div className="edit-task-section">

                                <div className="edit-task-section-title">

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

                            <div className="edit-task-section">

                                <div className="edit-task-section-title">

                                    <i className="bi bi-upload"></i>

                                    <span>
                                        Submission Settings
                                    </span>

                                </div>


                                {/* ALLOW RESUBMISSION */}

                                <div className="edit-task-setting-row">

                                    <div className="edit-task-setting-info">

                                        <div className="edit-task-setting-title">

                                            <i className="bi bi-arrow-repeat me-2"></i>

                                            Allow Resubmissions

                                        </div>

                                        <div className="edit-task-setting-description">

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

                                <div className="edit-task-setting-row">

                                    <div className="edit-task-setting-info">

                                        <div className="edit-task-setting-title">

                                            <i className="bi bi-123 me-2"></i>

                                            Maximum Attempts

                                        </div>

                                        <div className="edit-task-setting-description">

                                            Set how many times a student can submit. Leave blank for unlimited attempts.

                                        </div>

                                    </div>


                                    <div className="edit-task-setting-control">

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

                                <div className="edit-task-setting-row">

                                    <div className="edit-task-setting-info">

                                        <div className="edit-task-setting-title">

                                            <i className="bi bi-clock-history me-2"></i>

                                            Allow Late Submissions

                                        </div>

                                        <div className="edit-task-setting-description">

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

                            <div className="edit-task-actions">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary edit-cancel-btn"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >

                                    <i className="bi bi-x-lg me-2"></i>

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary edit-save-btn"
                                    disabled={saving}
                                >

                                    {saving ? (

                                        <>

                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>

                                            Saving Changes...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-check-lg me-2"></i>

                                            Save Changes

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


export default EditTask;