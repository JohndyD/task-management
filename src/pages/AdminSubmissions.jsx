import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

import "./../css/AdminLayout.css";
import "./../css/AdminSubmissions.css";


const API_BASE_URL =
    "http://localhost/task-management/php";

const CHECK_SESSION_URL =
    `${API_BASE_URL}/check_session.php`;

const GET_SUBMISSIONS_URL =
    `${API_BASE_URL}/admin/get_submissions.php`;

const VIEW_SUBMISSION_URL =
    `${API_BASE_URL}/admin/view_submission.php`;

const GRADE_SUBMISSION_URL =
    `${API_BASE_URL}/admin/grade_submission.php`;

const FILE_BASE_URL =
    "http://localhost/task-management/";


function AdminSubmissions() {

    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [user, setUser] = useState(null);

    const [submissions, setSubmissions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");


    const [selectedSubmission, setSelectedSubmission] =
        useState(null);

    const [openingSubmissionId, setOpeningSubmissionId] =
        useState(null);


    const [score, setScore] = useState("");

    const [feedback, setFeedback] = useState("");

    const [savingGrade, setSavingGrade] =
        useState(false);

    const [gradeMessage, setGradeMessage] =
        useState("");

    const [gradeError, setGradeError] =
        useState("");


    // =====================================================
    // CHECK SESSION
    // =====================================================

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


                const data = response.data;


                if (
                    !data.success ||
                    !data.loggedIn ||
                    !data.user
                ) {

                    navigate("/login");

                    return;
                }


                if (data.user.role !== "admin") {

                    navigate("/student");

                    return;
                }


                setUser(data.user);

            } catch (error) {

                console.error(
                    "Session check error:",
                    error
                );

                navigate("/login");
            }
        };


        checkSession();

    }, [navigate]);


    // =====================================================
    // LOAD SUBMISSIONS
    // =====================================================

    useEffect(() => {

        if (!user) {
            return;
        }


        loadSubmissions();

    }, [user]);


    const loadSubmissions = async () => {

        try {

            setLoading(true);

            setErrorMessage("");


            const response =
                await axios.get(
                    GET_SUBMISSIONS_URL,
                    {
                        withCredentials: true
                    }
                );


            if (!response.data.success) {

                setErrorMessage(
                    response.data.message ||
                    "Failed to load submissions."
                );

                return;
            }


            setSubmissions(
                Array.isArray(
                    response.data.submissions
                )
                    ? response.data.submissions
                    : []
            );

        } catch (error) {

            console.error(
                "Load submissions error:",
                error
            );

            setErrorMessage(
                "Unable to load submissions."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // VIEW SUBMISSION
    // =====================================================

    const handleViewSubmission = async (
        submissionId
    ) => {

        try {

            setOpeningSubmissionId(
                submissionId
            );

            setSelectedSubmission(null);

            setGradeMessage("");
            setGradeError("");


            const response =
                await axios.get(
                    VIEW_SUBMISSION_URL,
                    {
                        params: {
                            id: submissionId
                        },

                        withCredentials: true
                    }
                );


            if (!response.data.success) {

                setGradeError(
                    response.data.message ||
                    "Unable to load submission."
                );

                return;
            }


            const submission =
                response.data.submission;


            setSelectedSubmission(
                submission
            );


            setScore(
                submission.score !== null &&
                submission.score !== undefined
                    ? String(submission.score)
                    : ""
            );


            setFeedback(
                submission.feedback || ""
            );

        } catch (error) {

            console.error(
                "View submission error:",
                error
            );

            setGradeError(
                error.response?.data?.message ||
                "Unable to load submission."
            );

        } finally {

            setOpeningSubmissionId(null);
        }
    };


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const handleCloseModal = () => {

        if (savingGrade) {
            return;
        }


        setSelectedSubmission(null);

        setScore("");

        setFeedback("");

        setGradeMessage("");

        setGradeError("");
    };


    // =====================================================
    // SCORE CHANGE
    // =====================================================

    const handleScoreChange = (event) => {

        // Previous submissions cannot be edited.
        if (
            selectedSubmission &&
            selectedSubmission.isCurrent !== 1
        ) {
            return;
        }


        const value =
            event.target.value;


        if (value === "") {

            setScore("");

            return;
        }


        if (!/^\d+$/.test(value)) {
            return;
        }


        const maxScore =
            Number(
                selectedSubmission?.maxScore
            );


        if (
            !Number.isFinite(maxScore) ||
            maxScore < 0
        ) {

            return;
        }


        const numericValue =
            Number(value);


        if (numericValue > maxScore) {

            setScore(
                String(maxScore)
            );

            return;
        }


        setScore(value);
    };


    // =====================================================
    // SAVE GRADE
    // =====================================================

    const handleSaveGrade = async () => {

        if (!selectedSubmission) {
            return;
        }


        // =================================================
        // PREVIOUS SUBMISSION PROTECTION
        // =================================================

        if (
            selectedSubmission.isCurrent !== 1
        ) {

            setGradeError(
                "Previous submissions can be viewed but cannot be graded."
            );

            return;
        }


        setGradeMessage("");

        setGradeError("");


        const maxScore =
            Number(
                selectedSubmission.maxScore
            );


        const numericScore =
            Number(score);


        // =================================================
        // VALIDATE SCORE
        // =================================================

        if (
            score === "" ||
            !Number.isInteger(numericScore)
        ) {

            setGradeError(
                "Please enter a valid score."
            );

            return;
        }


        if (numericScore < 0) {

            setGradeError(
                "Score cannot be negative."
            );

            return;
        }


        if (numericScore > maxScore) {

            setGradeError(
                `Score cannot be greater than ${maxScore}.`
            );

            return;
        }


        try {

            setSavingGrade(true);


            const response =
                await axios.post(
                    GRADE_SUBMISSION_URL,

                    {
                        submission_id:
                            selectedSubmission.id,

                        score:
                            numericScore,

                        feedback:
                            feedback.trim()
                    },

                    {
                        withCredentials: true
                    }
                );


            if (!response.data.success) {

                setGradeError(
                    response.data.message ||
                    "Failed to save grade."
                );

                return;
            }


            // =================================================
            // UPDATE SELECTED SUBMISSION
            // =================================================

            const updatedSubmission = {

                ...selectedSubmission,

                score:
                    numericScore,

                feedback:
                    feedback.trim(),

                status:
                    "graded"
            };


            setSelectedSubmission(
                updatedSubmission
            );


            // =================================================
            // UPDATE TABLE
            // =================================================

            setSubmissions(
                previous =>
                    previous.map(
                        submission =>

                            submission.id ===
                            selectedSubmission.id

                                ? {
                                    ...submission,

                                    score:
                                        numericScore,

                                    feedback:
                                        feedback.trim(),

                                    status:
                                        "graded"
                                }

                                : submission
                    )
            );


            setGradeMessage(
                "Grade saved successfully."
            );

        } catch (error) {

            console.error(
                "Save grade error:",
                error
            );


            setGradeError(
                error.response?.data?.message ||
                "Unable to save grade."
            );

        } finally {

            setSavingGrade(false);
        }
    };


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (dateString) => {

        if (!dateString) {
            return "-";
        }


        const normalizedDate =
            String(dateString).includes("T")
                ? dateString
                : String(dateString).replace(
                    " ",
                    "T"
                );


        const date =
            new Date(normalizedDate);


        if (Number.isNaN(date.getTime())) {
            return dateString;
        }


        return date.toLocaleString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );
    };


    // =====================================================
    // FILE URL
    // =====================================================

    const getFileUrl = (filePath) => {

        if (!filePath) {
            return "#";
        }


        const cleanPath =
            String(filePath)
                .replace(/^\/+/, "");


        return encodeURI(
            FILE_BASE_URL + cleanPath
        );
    };


    // =====================================================
    // STATUS LABEL
    // =====================================================

    const getStatusLabel = (status) => {

        if (!status) {
            return "-";
        }


        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };


    // =====================================================
    // SUBMISSION TYPE LABEL
    // =====================================================

    const getSubmissionTypeLabel = (
        submissionType
    ) => {

        if (
            submissionType ===
            "resubmission"
        ) {

            return "Resubmission";
        }


        return "Initial";
    };


    // =====================================================
    // RENDER
    // =====================================================

    if (!user) {

        return (

            <div className="admin-layout">

                <div className="admin-content">

                    <div className="admin-submissions-loading">

                        <div
                            className="spinner-border"
                            role="status"
                        >

                            <span className="visually-hidden">
                                Loading...
                            </span>

                        </div>


                        <p>
                            Checking session...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    return (

        <div className="admin-layout">

            <AdminNavbar user={user} />

            <AdminSidebar />


            <main className="admin-main">

                <div className="admin-content">


                    {/* =====================================
                        PAGE HEADER
                    ====================================== */}

                    <div className="dashboard-header">

                        <div>

                            <h1 className="dashboard-title">
                                Submissions
                            </h1>


                            <p className="dashboard-subtitle">
                                Review, grade, and manage
                                student submissions.
                            </p>

                        </div>


                        <div className="dashboard-date">

                            <i className="bi bi-file-earmark-check me-2"></i>

                            {submissions.length}{" "}

                            {submissions.length === 1
                                ? "Submission"
                                : "Submissions"}

                        </div>

                    </div>


                    {/* =====================================
                        ERROR
                    ====================================== */}

                    {errorMessage && (

                        <div
                            className="alert alert-danger"
                            role="alert"
                        >

                            <i className="bi bi-exclamation-triangle me-2"></i>

                            {errorMessage}

                        </div>
                    )}


                    {/* =====================================
                        SUBMISSIONS TABLE
                    ====================================== */}

                    <div className="dashboard-section">

                        <div className="dashboard-card admin-submissions-card">


                            <div className="admin-submissions-card-header">

                                <div>

                                    <h2 className="dashboard-section-title">
                                        All Submissions
                                    </h2>


                                    <p className="dashboard-section-subtitle">
                                        View current and previous
                                        student submissions.
                                        Previous attempts cannot
                                        be graded.
                                    </p>

                                </div>

                            </div>


                            {loading ? (

                                <div className="admin-submissions-loading">

                                    <div
                                        className="spinner-border"
                                        role="status"
                                    >

                                        <span className="visually-hidden">
                                            Loading...
                                        </span>

                                    </div>


                                    <p>
                                        Loading submissions...
                                    </p>

                                </div>

                            ) : submissions.length === 0 ? (

                                <div className="admin-submissions-empty">

                                    <i className="bi bi-inbox"></i>


                                    <h5>
                                        No submissions found
                                    </h5>


                                    <p>
                                        Student submissions
                                        will appear here.
                                    </p>

                                </div>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table align-middle admin-submissions-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Student
                                                </th>

                                                <th>
                                                    Task
                                                </th>

                                                <th>
                                                    Attempt
                                                </th>

                                                <th>
                                                    Type
                                                </th>

                                                <th>
                                                    Submitted
                                                </th>

                                                <th>
                                                    Score
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {submissions.map(
                                                submission => (

                                                    <tr
                                                        key={
                                                            submission.id
                                                        }
                                                    >


                                                        {/* STUDENT */}

                                                        <td>

                                                            <div className="admin-submission-student">

                                                                <strong>
                                                                    {
                                                                        submission.studentName
                                                                    }
                                                                </strong>


                                                                <span>
                                                                    {
                                                                        submission.studentEmail
                                                                    }
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* TASK */}

                                                        <td>

                                                            <div className="admin-submission-task">

                                                                {
                                                                    submission.taskTitle
                                                                }

                                                            </div>

                                                        </td>


                                                        {/* ATTEMPT */}

                                                        <td>

                                                            <span className="admin-submission-attempt">

                                                                Attempt{" "}

                                                                {
                                                                    submission.attemptNumber
                                                                }


                                                                {submission.maxAttempts
                                                                    ? ` / ${submission.maxAttempts}`
                                                                    : ""}


                                                                {submission.isCurrent === 1 ? (

                                                                    <span className="admin-current-badge">
                                                                        Current
                                                                    </span>

                                                                ) : (

                                                                    <span className="admin-previous-badge">
                                                                        Previous
                                                                    </span>

                                                                )}

                                                            </span>

                                                        </td>


                                                        {/* TYPE */}

                                                        <td>

                                                            <span className="admin-submission-type">

                                                                {
                                                                    getSubmissionTypeLabel(
                                                                        submission.submissionType
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* SUBMITTED */}

                                                        <td>

                                                            <span className="admin-submission-date">

                                                                {
                                                                    formatDate(
                                                                        submission.submittedAt
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* SCORE */}

                                                        <td>

                                                            {submission.score !==
                                                                null &&
                                                            submission.score !==
                                                                undefined ? (

                                                                <strong>

                                                                    {
                                                                        submission.score
                                                                    }


                                                                    <span className="admin-score-max">

                                                                        /

                                                                        {
                                                                            submission.maxScore
                                                                        }

                                                                    </span>

                                                                </strong>

                                                            ) : (

                                                                <span className="text-muted">
                                                                    Not graded
                                                                </span>

                                                            )}

                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    `admin-submission-status ${
                                                                        submission.status ||
                                                                        ""
                                                                    }`
                                                                }
                                                            >

                                                                {
                                                                    getStatusLabel(
                                                                        submission.status
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ACTION */}

                                                        <td>

                                                            <button
                                                                type="button"
                                                                className="admin-submission-view-button"
                                                                onClick={() =>
                                                                    handleViewSubmission(
                                                                        submission.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    openingSubmissionId ===
                                                                    submission.id
                                                                }
                                                            >

                                                                {openingSubmissionId ===
                                                                submission.id ? (

                                                                    <>

                                                                        <span
                                                                            className="spinner-border spinner-border-sm me-2"
                                                                            role="status"
                                                                        ></span>

                                                                        Loading

                                                                    </>

                                                                ) : (

                                                                    <>

                                                                        <i className="bi bi-eye me-2"></i>

                                                                        View

                                                                    </>

                                                                )}

                                                            </button>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </main>


            {/* =========================================
                SUBMISSION MODAL
            ========================================== */}

            {selectedSubmission && (

                <div
                    className="admin-submission-modal-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            handleCloseModal();
                        }

                    }}
                >


                    <div className="admin-submission-modal">


                        {/* =================================
                            MODAL HEADER
                        ================================== */}

                        <div className="admin-submission-modal-header">

                            <div>

                                <h3>
                                    Review Submission
                                </h3>


                                <p>

                                    Attempt{" "}

                                    {
                                        selectedSubmission.attemptNumber
                                    }


                                    {selectedSubmission.maxAttempts
                                        ? ` of ${selectedSubmission.maxAttempts}`
                                        : ""}

                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-submission-modal-close"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={
                                    savingGrade
                                }
                                aria-label="Close"
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        {/* =================================
                            MODAL BODY
                        ================================== */}

                        <div className="admin-submission-modal-body">


                            {/* STUDENT */}

                            <div className="admin-submission-info-grid">


                                <div className="admin-submission-info">

                                    <span>
                                        Student
                                    </span>


                                    <strong>
                                        {
                                            selectedSubmission.studentName
                                        }
                                    </strong>


                                    <small>
                                        {
                                            selectedSubmission.studentEmail
                                        }
                                    </small>

                                </div>


                                <div className="admin-submission-info">

                                    <span>
                                        Task
                                    </span>


                                    <strong>
                                        {
                                            selectedSubmission.taskTitle
                                        }
                                    </strong>

                                </div>


                                <div className="admin-submission-info">

                                    <span>
                                        Attempt
                                    </span>


                                    <strong>

                                        {
                                            selectedSubmission.attemptNumber
                                        }


                                        {selectedSubmission.maxAttempts
                                            ? ` / ${selectedSubmission.maxAttempts}`
                                            : ""}

                                    </strong>


                                    <small>

                                        {
                                            getSubmissionTypeLabel(
                                                selectedSubmission.submissionType
                                            )
                                        }

                                    </small>

                                </div>


                                <div className="admin-submission-info">

                                    <span>
                                        Submitted
                                    </span>


                                    <strong>

                                        {
                                            formatDate(
                                                selectedSubmission.submittedAt
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* =================================
                                CURRENT / PREVIOUS STATUS
                            ================================== */}

                            <div className="admin-submission-current-status">


                                {selectedSubmission.isCurrent === 1 ? (

                                    <>

                                        <i className="bi bi-check-circle-fill"></i>


                                        <span>
                                            This is the student's
                                            current submission
                                            and can be graded.
                                        </span>

                                    </>

                                ) : (

                                    <>

                                        <i className="bi bi-clock-history"></i>


                                        <span>
                                            This is a previous
                                            submission attempt.
                                            It can be viewed but
                                            cannot be graded.
                                        </span>

                                    </>

                                )}

                            </div>


                            {/* =================================
                                FILE
                            ================================== */}

                            <div className="admin-submission-file-section">


                                <h4>

                                    <i className="bi bi-file-earmark-arrow-down me-2"></i>

                                    Submitted File

                                </h4>


                                <a
                                    href={
                                        getFileUrl(
                                            selectedSubmission.filePath
                                        )
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="admin-submission-file-link"
                                >

                                    <i className="bi bi-download"></i>


                                    <span>
                                        Open Submitted File
                                    </span>


                                    <i className="bi bi-box-arrow-up-right"></i>

                                </a>

                            </div>


                            {/* =================================
                                GRADE
                            ================================== */}

                            <div className="admin-submission-grade-section">


                                <div className="admin-submission-section-title">

                                    <h4>
                                        Grade
                                    </h4>


                                    <span>

                                        Maximum:{" "}

                                        {
                                            selectedSubmission.maxScore
                                        }

                                    </span>

                                </div>


                                <div className="admin-submission-score-wrapper">


                                    <input
                                        type="number"
                                        min="0"
                                        max={
                                            selectedSubmission.maxScore
                                        }
                                        step="1"
                                        value={score}
                                        onChange={
                                            handleScoreChange
                                        }
                                        className="form-control admin-submission-score-input"
                                        disabled={
                                            savingGrade ||
                                            selectedSubmission.isCurrent !== 1
                                        }
                                    />


                                    <span>

                                        /

                                        {
                                            selectedSubmission.maxScore
                                        }

                                    </span>

                                </div>

                            </div>


                            {/* =================================
                                FEEDBACK
                            ================================== */}

                            <div className="admin-submission-feedback-section">


                                <label htmlFor="submissionFeedback">
                                    Feedback
                                </label>


                                <textarea
                                    id="submissionFeedback"
                                    className="form-control"
                                    rows="5"
                                    value={feedback}
                                    onChange={(event) =>
                                        setFeedback(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter feedback for the student..."
                                    disabled={
                                        savingGrade ||
                                        selectedSubmission.isCurrent !== 1
                                    }
                                />

                            </div>


                            {/* =================================
                                PREVIOUS SUBMISSION NOTICE
                            ================================== */}

                            {selectedSubmission.isCurrent !== 1 && (

                                <div className="alert alert-secondary">

                                    <i className="bi bi-info-circle me-2"></i>

                                    This is a previous submission.
                                    You can view the submitted file,
                                    score, and feedback, but this
                                    submission cannot be graded.

                                </div>

                            )}


                            {/* =================================
                                SUCCESS MESSAGE
                            ================================== */}

                            {gradeMessage && (

                                <div className="alert alert-success">

                                    <i className="bi bi-check-circle me-2"></i>

                                    {
                                        gradeMessage
                                    }

                                </div>

                            )}


                            {/* =================================
                                ERROR MESSAGE
                            ================================== */}

                            {gradeError && (

                                <div className="alert alert-danger">

                                    <i className="bi bi-exclamation-triangle me-2"></i>

                                    {
                                        gradeError
                                    }

                                </div>

                            )}

                        </div>


                        {/* =================================
                            MODAL FOOTER
                        ================================== */}

                        <div className="admin-submission-modal-footer">


                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={
                                    savingGrade
                                }
                            >

                                Close

                            </button>


                            {/* =================================
                                SAVE GRADE
                            ================================== */}

                            {selectedSubmission.isCurrent === 1 && (

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={
                                        handleSaveGrade
                                    }
                                    disabled={
                                        savingGrade
                                    }
                                >

                                    {savingGrade ? (

                                        <>

                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>

                                            Saving...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-check-lg me-2"></i>

                                            Save Grade

                                        </>

                                    )}

                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default AdminSubmissions;

