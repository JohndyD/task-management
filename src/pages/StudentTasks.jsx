import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import StudentNavbar from "../components/StudentNavbar";
import StudentSidebar from "../components/StudentSidebar";

import "../css/StudentTasks.css";


const CHECK_SESSION_URL =
    "http://localhost/task-management/php/check_session.php";

const STUDENT_TASKS_URL =
    "http://localhost/task-management/php/student/student_tasks.php";

const SUBMIT_TASK_URL =
    "http://localhost/task-management/php/student/submit_task.php";


function StudentTasks() {

    const navigate = useNavigate();


    const [user, setUser] = useState(null);

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);

    const [errorMessage, setErrorMessage] = useState("");

    const [successMessage, setSuccessMessage] = useState("");


    /*
    |--------------------------------------------------------------------------
    | LOAD TASKS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        let mounted = true;


        const loadTasks = async () => {

            try {

                /*
                |--------------------------------------------------------------------------
                | CHECK SESSION
                |--------------------------------------------------------------------------
                */

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


                /*
                |--------------------------------------------------------------------------
                | CHECK STUDENT ROLE
                |--------------------------------------------------------------------------
                */

                if (
                    !sessionData.user ||
                    sessionData.user.role !== "student"
                ) {

                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );

                    return;

                }


                /*
                |--------------------------------------------------------------------------
                | SAVE USER
                |--------------------------------------------------------------------------
                */

                if (mounted) {

                    setUser(
                        sessionData.user
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | LOAD TASKS
                |--------------------------------------------------------------------------
                */

                const response =
                    await axios.get(
                        STUDENT_TASKS_URL,
                        {
                            withCredentials: true
                        }
                    );


                if (!response.data.success) {

                    if (mounted) {

                        setErrorMessage(
                            response.data.message ||
                            "Failed to load tasks."
                        );

                    }

                    return;

                }


                if (mounted) {

                    setTasks(
                        Array.isArray(
                            response.data.tasks
                        )
                            ? response.data.tasks
                            : []
                    );

                }

            } catch (error) {

                console.error(
                    "Tasks error:",
                    error
                );


                if (mounted) {

                    setErrorMessage(
                        error.response?.data?.message ||
                        "Failed to load tasks."
                    );

                }

            } finally {

                if (mounted) {

                    setLoading(false);

                }

            }

        };


        loadTasks();


        return () => {

            mounted = false;

        };

    }, [navigate]);


    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    const formatDate = (dateValue) => {

        if (!dateValue) {

            return "No deadline";

        }


        const date = new Date(
            dateValue.replace(" ", "T")
        );


        if (isNaN(date.getTime())) {

            return dateValue;

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
    | FORMAT DATE AND TIME
    |--------------------------------------------------------------------------
    */

    const formatDateTime = (dateValue) => {

        if (!dateValue) {

            return "";

        }


        const date = new Date(
            dateValue.replace(" ", "T")
        );


        if (isNaN(date.getTime())) {

            return dateValue;

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


    /*
    |--------------------------------------------------------------------------
    | CHECK IF DEADLINE HAS PASSED
    |--------------------------------------------------------------------------
    */

    const isTaskMissed = (deadline) => {

        if (!deadline) {

            return false;

        }


        const deadlineDate = new Date(
            deadline.replace(" ", "T")
        );


        if (isNaN(deadlineDate.getTime())) {

            return false;

        }


        return deadlineDate < new Date();

    };


    /*
    |--------------------------------------------------------------------------
    | CHECK IF STUDENT CAN SUBMIT
    |--------------------------------------------------------------------------
    |
    | Rules:
    |
    | 1. Deadline passed + late submission disabled
    |    = cannot submit.
    |
    | 2. Existing submission + resubmission disabled
    |    = cannot submit again.
    |
    | 3. Maximum attempts reached
    |    = cannot submit again.
    |
    */

    const canSubmitTask = (task) => {

        if (!task) {

            return false;

        }


        const missed =
            isTaskMissed(
                task.deadline
            );


        /*
        |--------------------------------------------------------------------------
        | DEADLINE CHECK
        |--------------------------------------------------------------------------
        */

        if (
            missed &&
            !task.allowLateSubmission
        ) {

            return false;

        }


        /*
        |--------------------------------------------------------------------------
        | RESUBMISSION CHECK
        |--------------------------------------------------------------------------
        */

        if (
            task.submission &&
            !task.allowResubmission
        ) {

            return false;

        }


        /*
        |--------------------------------------------------------------------------
        | MAX ATTEMPTS CHECK
        |--------------------------------------------------------------------------
        */

        if (
            task.maxAttempts !== null &&
            task.maxAttempts !== undefined &&
            Number(task.attemptCount || 0) >=
            Number(task.maxAttempts)
        ) {

            return false;

        }


        return true;

    };


    /*
    |--------------------------------------------------------------------------
    | GET SUBMISSION BUTTON TEXT
    |--------------------------------------------------------------------------
    */

    const getSubmitButtonText = (task) => {

        if (task.submission) {

            return "Submit Again";

        }


        return "Submit Task";

    };


    /*
    |--------------------------------------------------------------------------
    | GET SUBMISSION RESTRICTION MESSAGE
    |--------------------------------------------------------------------------
    */

    const getSubmissionRestrictionMessage = (task) => {

        if (!task) {

            return "";

        }


        const missed =
            isTaskMissed(
                task.deadline
            );


        /*
        |--------------------------------------------------------------------------
        | DEADLINE PASSED
        |--------------------------------------------------------------------------
        */

        if (
            missed &&
            !task.allowLateSubmission
        ) {

            return "Deadline Passed";

        }


        /*
        |--------------------------------------------------------------------------
        | MAXIMUM ATTEMPTS
        |--------------------------------------------------------------------------
        */

        if (
            task.maxAttempts !== null &&
            task.maxAttempts !== undefined &&
            Number(task.attemptCount || 0) >=
            Number(task.maxAttempts)
        ) {

            return "Maximum Attempts Reached";

        }


        /*
        |--------------------------------------------------------------------------
        | RESUBMISSION DISABLED
        |--------------------------------------------------------------------------
        */

        if (
            task.submission &&
            !task.allowResubmission
        ) {

            return "Already Submitted";

        }


        return "";

    };


    /*
    |--------------------------------------------------------------------------
    | OPEN SUBMIT MODAL
    |--------------------------------------------------------------------------
    */

    const openSubmitModal = (task) => {

        if (!canSubmitTask(task)) {

            setErrorMessage(
                getSubmissionRestrictionMessage(task) ||
                "You cannot submit this task."
            );

            return;

        }


        setSelectedTask(task);

        setSelectedFile(null);

        setErrorMessage("");

        setSuccessMessage("");

    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE SUBMIT MODAL
    |--------------------------------------------------------------------------
    */

    const closeSubmitModal = () => {

        if (submitting) {

            return;

        }


        setSelectedTask(null);

        setSelectedFile(null);

        setErrorMessage("");

        setSuccessMessage("");

    };


    /*
    |--------------------------------------------------------------------------
    | HANDLE FILE SELECT
    |--------------------------------------------------------------------------
    */

    const handleFileChange = (event) => {

        setErrorMessage("");

        setSuccessMessage("");


        const file =
            event.target.files?.[0];


        if (!file) {

            setSelectedFile(null);

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | MAXIMUM FILE SIZE
        |--------------------------------------------------------------------------
        |
        | 10 MB
        |
        */

        const maxSize =
            10 * 1024 * 1024;


        if (file.size > maxSize) {

            setSelectedFile(null);

            event.target.value = "";

            setErrorMessage(
                "File size must not exceed 10 MB."
            );

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | ALLOWED FILE TYPES
        |--------------------------------------------------------------------------
        */

        const fileName =
            file.name.toLowerCase();


        const allowedTypes = [
            ".zip",
            ".pdf",
            ".txt"
        ];


        const isAllowed =
            allowedTypes.some(
                (extension) =>
                    fileName.endsWith(extension)
            );


        if (!isAllowed) {

            setSelectedFile(null);

            event.target.value = "";

            setErrorMessage(
                "Invalid file type. Only .zip, .pdf, and .txt files are allowed."
            );

            return;

        }


        setSelectedFile(file);

    };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT TASK
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {

        event.preventDefault();


        setErrorMessage("");

        setSuccessMessage("");


        /*
        |--------------------------------------------------------------------------
        | CHECK TASK
        |--------------------------------------------------------------------------
        */

        if (!selectedTask) {

            setErrorMessage(
                "No task selected."
            );

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | CHECK FILE
        |--------------------------------------------------------------------------
        */

        if (!selectedFile) {

            setErrorMessage(
                "Please select a file."
            );

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | CHECK SUBMISSION PERMISSION
        |--------------------------------------------------------------------------
        */

        if (!canSubmitTask(selectedTask)) {

            setErrorMessage(
                getSubmissionRestrictionMessage(
                    selectedTask
                ) ||
                "You cannot submit this task."
            );

            return;

        }


        try {

            setSubmitting(true);


            /*
            |--------------------------------------------------------------------------
            | CREATE FORM DATA
            |--------------------------------------------------------------------------
            */

            const formData =
                new FormData();


            formData.append(
                "task_id",
                selectedTask.id
            );


            formData.append(
                "file",
                selectedFile
            );


            /*
            |--------------------------------------------------------------------------
            | SEND FILE
            |--------------------------------------------------------------------------
            */

            const response =
                await axios.post(
                    SUBMIT_TASK_URL,
                    formData,
                    {
                        withCredentials: true
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | CHECK RESPONSE
            |--------------------------------------------------------------------------
            */

            if (!response.data.success) {

                setErrorMessage(
                    response.data.message ||
                    "Failed to submit task."
                );

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | CREATE NEW SUBMISSION
            |--------------------------------------------------------------------------
            */

            const newSubmission = {

                id:
                    response.data.submission.id,

                filePath:
                    response.data.submission.filePath,

                score:
                    null,

                feedback:
                    null,

                status:
                    "submitted",

                submittedAt:
                    response.data.submission.submittedAt ||
                    new Date().toISOString()

            };


            /*
            |--------------------------------------------------------------------------
            | UPDATE TASK LOCALLY
            |--------------------------------------------------------------------------
            */

            setTasks(
                (currentTasks) =>

                    currentTasks.map(
                        (task) => {

                            if (
                                task.id ===
                                selectedTask.id
                            ) {

                                const newAttemptCount =
                                    Number(
                                        task.attemptCount || 0
                                    ) + 1;


                                return {

                                    ...task,

                                    submission:
                                        newSubmission,

                                    attemptCount:
                                        newAttemptCount

                                };

                            }


                            return task;

                        }
                    )
            );


            /*
            |--------------------------------------------------------------------------
            | UPDATE SELECTED TASK
            |--------------------------------------------------------------------------
            */

            setSelectedTask(
                (currentTask) => {

                    if (!currentTask) {

                        return currentTask;

                    }


                    return {

                        ...currentTask,

                        submission:
                            newSubmission,

                        attemptCount:
                            Number(
                                currentTask.attemptCount || 0
                            ) + 1

                    };

                }
            );


            /*
            |--------------------------------------------------------------------------
            | SHOW SUCCESS
            |--------------------------------------------------------------------------
            */

            setSuccessMessage(
                "Task submitted successfully."
            );


            setSelectedFile(null);

        } catch (error) {

            console.error(
                "Submit task error:",
                error
            );


            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {

                setErrorMessage(
                    error.response.data.message
                );

            } else {

                setErrorMessage(
                    "Failed to submit task."
                );

            }

        } finally {

            setSubmitting(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="student-loading">

                <div className="spinner-border text-primary">
                </div>

                <div className="mt-2">
                    Loading tasks...
                </div>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

    return (

        <div className="student-layout">


            {/* NAVBAR */}

            <StudentNavbar
                user={user}
            />


            {/* SIDEBAR */}

            <StudentSidebar />


            {/* MAIN CONTENT */}

            <main className="admin-main">

                <div className="admin-content">


                    {/* PAGE HEADER */}

                    <div className="student-tasks-header">

                        <div>

                            <h2 className="student-tasks-title">
                                My Tasks
                            </h2>

                            <p className="student-tasks-subtitle">
                                View your tasks and submit your work before the deadline.
                            </p>

                        </div>


                        <Link
                            to="/student"
                            className="student-back-button"
                        >

                            <i className="bi bi-arrow-left me-2"></i>

                            Dashboard

                        </Link>

                    </div>


                    {/* ERROR MESSAGE */}

                    {errorMessage &&
                        !selectedTask && (

                            <div className="alert alert-danger">

                                <i className="bi bi-exclamation-circle me-2"></i>

                                {errorMessage}

                            </div>

                        )
                    }


                    {/* NO TASKS */}

                    {tasks.length === 0 ? (

                        <div className="student-tasks-empty">

                            <i className="bi bi-list-task"></i>

                            <h5>
                                No Tasks Available
                            </h5>

                            <p>
                                There are currently no tasks available.
                            </p>

                        </div>

                    ) : (

                        <div className="student-task-list">

                            {tasks.map((task) => {

                                const missed =
                                    isTaskMissed(
                                        task.deadline
                                    );


                                const submission =
                                    task.submission;


                                const canSubmit =
                                    canSubmitTask(task);


                                const restrictionMessage =
                                    getSubmissionRestrictionMessage(
                                        task
                                    );


                                /*
                                |--------------------------------------------------------------------------
                                | DETERMINE STATUS
                                |--------------------------------------------------------------------------
                                */

                                let statusText =
                                    "Pending";

                                let statusClass =
                                    "pending";


                                if (submission) {

                                    if (
                                        submission.status ===
                                        "graded"
                                    ) {

                                        statusText =
                                            "Graded";

                                        statusClass =
                                            "graded";

                                    } else {

                                        statusText =
                                            "Submitted";

                                        statusClass =
                                            "submitted";

                                    }

                                } else if (missed) {

                                    statusText =
                                        "Missed";

                                    statusClass =
                                        "missed";

                                }


                                return (

                                    <div
                                        className="student-full-task-card"
                                        key={task.id}
                                    >


                                        {/* TASK TOP */}

                                        <div className="student-task-card-top">

                                            <div>

                                                <h4 className="student-full-task-title">
                                                    {task.title}
                                                </h4>


                                                <div className="student-full-task-creator">

                                                    <i className="bi bi-person-fill me-1"></i>

                                                    Created by:

                                                    {" "}

                                                    {task.creatorName ||
                                                        "Unknown"}

                                                </div>

                                            </div>


                                            <span
                                                className={
                                                    `student-full-task-status ${statusClass}`
                                                }
                                            >

                                                {statusText}

                                            </span>

                                        </div>


                                        {/* DESCRIPTION */}

                                        <div className="student-full-task-description">

                                            {task.description
                                                ? task.description
                                                : "No description provided."
                                            }

                                        </div>


                                        {/* TASK DETAILS */}

                                        <div className="student-full-task-details">


                                            <div className="student-task-detail">

                                                <i className="bi bi-calendar3"></i>

                                                <div>

                                                    <span>
                                                        Deadline
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            task.deadline
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="student-task-detail">

                                                <i className="bi bi-clock"></i>

                                                <div>

                                                    <span>
                                                        Due
                                                    </span>

                                                    <strong>
                                                        {formatDateTime(
                                                            task.deadline
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="student-task-detail">

                                                <i className="bi bi-star"></i>

                                                <div>

                                                    <span>
                                                        Maximum Score
                                                    </span>

                                                    <strong>
                                                        {task.maxScore} pts
                                                    </strong>

                                                </div>

                                            </div>


                                        </div>


                                        {/* SUBMISSION SETTINGS */}

                                        <div className="student-task-submission-settings">


                                            {/* RESUBMISSIONS */}

                                            <div className="student-task-setting-item">

                                                <span className="student-task-setting-label">

                                                    <i className="bi bi-arrow-repeat me-1"></i>

                                                    Resubmissions

                                                </span>


                                                <strong className="student-task-setting-value">

                                                    {task.allowResubmission
                                                        ? "Allowed"
                                                        : "Not Allowed"
                                                    }

                                                </strong>

                                            </div>


                                            {/* ATTEMPTS */}

                                            <div className="student-task-setting-item">

                                                <span className="student-task-setting-label">

                                                    <i className="bi bi-123 me-1"></i>

                                                    Attempts

                                                </span>


                                                <strong className="student-task-setting-value">

                                                    {task.maxAttempts === null ||
                                                        task.maxAttempts === undefined
                                                        ? "Unlimited"
                                                        : `${task.attemptCount} / ${task.maxAttempts}`
                                                    }

                                                </strong>

                                            </div>


                                            {/* LATE SUBMISSION */}

                                            <div className="student-task-setting-item">

                                                <span className="student-task-setting-label">

                                                    <i className="bi bi-clock-history me-1"></i>

                                                    Late Submission

                                                </span>


                                                <strong className="student-task-setting-value">

                                                    {task.allowLateSubmission
                                                        ? "Allowed"
                                                        : "Not Allowed"
                                                    }

                                                </strong>

                                            </div>


                                        </div>


                                        {/* SUBMISSION INFORMATION */}

                                        {submission && (

                                            <div className="student-submission-info">

                                                <div>

                                                    <div className="student-submission-label">

                                                        <i className="bi bi-file-earmark-check me-1"></i>

                                                        Latest Submitted File

                                                    </div>


                                                    <div className="student-submission-file">

                                                        {submission.filePath}

                                                    </div>


                                                    <div className="student-submission-date">

                                                        Submitted:

                                                        {" "}

                                                        {formatDateTime(
                                                            submission.submittedAt
                                                        )}

                                                    </div>

                                                </div>


                                                {/* SCORE */}

                                                {submission.status === "graded" &&
                                                    submission.score !== null && (

                                                        <div className="student-submission-score">

                                                            <span>
                                                                Score
                                                            </span>

                                                            <strong>

                                                                {submission.score}

                                                                /

                                                                {task.maxScore}

                                                            </strong>

                                                        </div>

                                                    )}


                                                {/* FEEDBACK */}

                                                {submission.status === "graded" &&
                                                    submission.feedback && (

                                                        <div className="student-submission-feedback">

                                                            <div className="student-submission-feedback-label">

                                                                <i className="bi bi-chat-left-text me-1"></i>

                                                                Instructor Feedback

                                                            </div>


                                                            <div className="student-submission-feedback-text">

                                                                {submission.feedback}

                                                            </div>

                                                        </div>

                                                    )}

                                            </div>

                                        )}


                                        {/* ACTION AREA */}

                                        <div className="student-task-card-footer">


                                            <div className="student-task-file-note">

                                                <i className="bi bi-paperclip me-1"></i>

                                                ZIP, PDF, or TXT · Maximum 10 MB

                                            </div>


                                            {canSubmit && (

                                                <button
                                                    type="button"
                                                    className="student-submit-button"
                                                    onClick={() =>
                                                        openSubmitModal(task)
                                                    }
                                                >

                                                    <i className="bi bi-upload me-2"></i>

                                                    {getSubmitButtonText(task)}

                                                </button>

                                            )}


                                            {!canSubmit &&
                                                restrictionMessage && (

                                                    <span className="student-missed-text">

                                                        <i
                                                            className={
                                                                missed
                                                                    ? "bi bi-exclamation-triangle me-1"
                                                                    : "bi bi-lock me-1"
                                                            }
                                                        ></i>

                                                        {restrictionMessage}

                                                    </span>

                                                )}

                                        </div>


                                    </div>

                                );

                            })}

                        </div>

                    )}

                </div>

            </main>


            {/* SUBMISSION MODAL */}

            {selectedTask && (

                <div
                    className="student-modal-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeSubmitModal();

                        }

                    }}
                >

                    <div className="student-submit-modal">


                        {/* MODAL HEADER */}

                        <div className="student-submit-modal-header">

                            <div>

                                <h5>

                                    {selectedTask.submission
                                        ? "Submit Again"
                                        : "Submit Task"
                                    }

                                </h5>


                                <p>
                                    {selectedTask.title}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="student-modal-close"
                                onClick={
                                    closeSubmitModal
                                }
                                disabled={
                                    submitting
                                }
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="student-submit-form"
                        >


                            {/* DEADLINE */}

                            <div className="student-submit-deadline">

                                <i className="bi bi-calendar3"></i>

                                <div>

                                    <span>
                                        Deadline
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selectedTask.deadline
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* ATTEMPT INFORMATION */}

                            <div className="student-submit-attempt-info">

                                <div>

                                    <span>
                                        Attempts Used
                                    </span>

                                    <strong>
                                        {selectedTask.attemptCount}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Maximum Attempts
                                    </span>

                                    <strong>

                                        {selectedTask.maxAttempts === null ||
                                            selectedTask.maxAttempts === undefined
                                            ? "Unlimited"
                                            : selectedTask.maxAttempts
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Late Submission
                                    </span>

                                    <strong>

                                        {selectedTask.allowLateSubmission
                                            ? "Allowed"
                                            : "Not Allowed"
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* FILE INPUT */}

                            <div className="student-file-upload">

                                <label
                                    htmlFor="submission-file"
                                    className="student-file-label"
                                >

                                    <i className="bi bi-cloud-arrow-up"></i>

                                    <span>
                                        Choose your file
                                    </span>

                                    <small>
                                        ZIP, PDF, or TXT · Maximum 10 MB
                                    </small>

                                </label>


                                <input
                                    id="submission-file"
                                    type="file"
                                    accept=".zip,.pdf,.txt"
                                    onChange={
                                        handleFileChange
                                    }
                                    disabled={
                                        submitting
                                    }
                                />


                                {selectedFile && (

                                    <div className="student-selected-file">

                                        <i className="bi bi-file-earmark"></i>

                                        <div>

                                            <strong>
                                                {selectedFile.name}
                                            </strong>

                                            <small>

                                                {" "}

                                                (

                                                {(
                                                    selectedFile.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}

                                                {" "}

                                                MB)

                                            </small>

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* ERROR */}

                            {errorMessage && (

                                <div className="alert alert-danger mb-0">

                                    <i className="bi bi-exclamation-circle me-2"></i>

                                    {errorMessage}

                                </div>

                            )}


                            {/* SUCCESS */}

                            {successMessage && (

                                <div className="alert alert-success mb-0">

                                    <i className="bi bi-check-circle me-2"></i>

                                    {successMessage}

                                </div>

                            )}


                            {/* BUTTONS */}

                            <div className="student-submit-modal-footer">

                                <button
                                    type="button"
                                    className="student-cancel-button"
                                    onClick={
                                        closeSubmitModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="student-submit-confirm-button"
                                    disabled={
                                        submitting ||
                                        !selectedFile
                                    }
                                >

                                    {submitting ? (

                                        <>

                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                            ></span>

                                            Uploading...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-upload me-2"></i>

                                            {selectedTask.submission
                                                ? "Submit Again"
                                                : "Submit Task"
                                            }

                                        </>

                                    )}

                                </button>

                            </div>


                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default StudentTasks;