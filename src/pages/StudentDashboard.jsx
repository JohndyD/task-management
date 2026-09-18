import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import StudentNavbar from "../components/StudentNavbar";
import StudentSidebar from "../components/StudentSidebar";

import "../css/StudentDashboard.css";


const CHECK_SESSION_URL =
    "http://localhost/task-management/php/check_session.php";

const DASHBOARD_STATS_URL =
    "http://localhost/task-management/php/student/student_dashboard.php";

const STUDENT_TASKS_URL =
    "http://localhost/task-management/php/student/student_tasks.php";


function StudentDashboard() {

    const navigate = useNavigate();


    const [user, setUser] = useState(null);

    const [stats, setStats] = useState({
        totalTasks: 0,
        submittedTasks: 0,
        missedTasks: 0
    });

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);

    const [tasksLoading, setTasksLoading] = useState(true);


    // ========================================
    // LOAD DASHBOARD
    // ========================================

    useEffect(() => {

        let mounted = true;


        const loadDashboard = async () => {

            try {

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


                // ========================================
                // NOT LOGGED IN
                // ========================================

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
                // CHECK STUDENT ROLE
                // ========================================

                if (
                    !sessionData.user ||
                    sessionData.user.role !== "student"
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

                    setUser(
                        sessionData.user
                    );

                }


                // ========================================
                // LOAD DASHBOARD STATS
                // ========================================

                const statsResponse =
                    await axios.get(
                        DASHBOARD_STATS_URL,
                        {
                            withCredentials: true
                        }
                    );


                if (
                    statsResponse.data.success &&
                    mounted
                ) {

                    setStats(
                        statsResponse.data.stats
                    );

                }


                // ========================================
                // LOAD TASKS
                // ========================================

                const tasksResponse =
                    await axios.get(
                        STUDENT_TASKS_URL,
                        {
                            withCredentials: true
                        }
                    );


                if (
                    tasksResponse.data.success &&
                    mounted
                ) {

                    setTasks(
                        Array.isArray(
                            tasksResponse.data.tasks
                        )
                            ? tasksResponse.data.tasks
                            : []
                    );

                }

            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );


                if (mounted) {

                    navigate("/login", {
                        replace: true
                    });

                }

            } finally {

                if (mounted) {

                    setLoading(false);

                    setTasksLoading(false);

                }

            }

        };


        loadDashboard();


        return () => {

            mounted = false;

        };

    }, [navigate]);


    // ========================================
    // FORMAT DEADLINE
    // ========================================

    const formatDeadline = (deadline) => {

        if (!deadline) {

            return "No deadline";

        }


        const date = new Date(
            deadline.replace(" ", "T")
        );


        if (isNaN(date.getTime())) {

            return deadline;

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
    // FORMAT DATE AND TIME
    // ========================================

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


    // ========================================
    // GET FILE NAME
    // ========================================
    //
    // The database stores file_path, for example:
    //
    // uploads/submissions/task_1_student_2_20260918120000.zip
    //
    // We only display the actual file name.
    //
    // ========================================

    const getFileName = (filePath) => {

        if (!filePath) {

            return "Submitted file";

        }


        return filePath
            .split("/")
            .pop();

    };


    // ========================================
    // CHECK TASK STATUS
    // ========================================

    const getTaskStatus = (task) => {

        // ========================================
        // SUBMITTED / GRADED
        // ========================================

        if (task.submission) {

            if (
                task.submission.status ===
                "graded"
            ) {

                return "graded";

            }


            return "submitted";

        }


        // ========================================
        // NO SUBMISSION
        // ========================================

        if (!task.deadline) {

            return "pending";

        }


        const deadlineDate = new Date(
            task.deadline.replace(" ", "T")
        );


        const now = new Date();


        if (
            !isNaN(deadlineDate.getTime()) &&
            deadlineDate < now
        ) {

            return "missed";

        }


        return "pending";

    };


    // ========================================
    // MY TASKS
    // ========================================
    //
    // IMPORTANT:
    //
    // Submitted tasks are removed from My Tasks.
    //
    // Therefore My Tasks only contains:
    //
    // - Pending tasks
    // - Missed tasks
    //
    // Submitted / graded tasks appear under
    // Recent Submissions instead.
    //
    // ========================================

    const myTasks =
        tasks.filter(
            (task) =>
                !task.submission
        );


    // ========================================
    // RECENT SUBMISSIONS
    // ========================================
    //
    // Only submitted tasks are included.
    // Newest submissions appear first.
    //
    // Limit to 5 submissions.
    //
    // ========================================

    const recentSubmissions =
        tasks
            .filter(
                (task) =>
                    task.submission !== null &&
                    task.submission !== undefined
            )
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            (
                                a.submission.submittedAt ||
                                ""
                            ).replace(" ", "T")
                        );

                    const dateB =
                        new Date(
                            (
                                b.submission.submittedAt ||
                                ""
                            ).replace(" ", "T")
                        );


                    return dateB - dateA;

                }
            )
            .slice(0, 5);


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (

            <div className="student-loading">

                <div className="spinner-border text-primary">
                </div>

                <div className="mt-2">
                    Loading dashboard...
                </div>

            </div>

        );

    }


    // ========================================
    // DASHBOARD
    // ========================================

    return (

        <div className="student-layout">


            {/* ========================================
                NAVBAR
            ======================================== */}

            <StudentNavbar
                user={user}
            />


            {/* ========================================
                SIDEBAR
            ======================================== */}

            <StudentSidebar />


            {/* ========================================
                MAIN CONTENT
            ======================================== */}

            <main className="admin-main">

                <div className="admin-content">


                    {/* ========================================
                        DASHBOARD HEADER
                    ======================================== */}

                    <div className="student-dashboard-header">

                        <div>

                            <h2 className="student-dashboard-title">
                                Welcome, {user?.name || "Student"}
                            </h2>

                            <p className="student-dashboard-subtitle">
                                Track your assigned tasks and submissions.
                            </p>

                        </div>


                        <div className="student-dashboard-date">

                            <i className="bi bi-calendar3 me-2"></i>

                            {new Date().toLocaleDateString(
                                "en-US",
                                {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                }
                            )}

                        </div>

                    </div>


                    {/* ========================================
                        STAT CARDS
                    ======================================== */}

                    <div className="row g-4">


                        {/* TOTAL TASKS */}

                        <div className="col-lg-4 col-md-6">

                            <div className="student-stat-card">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>

                                            <div className="student-stat-label">
                                                Total Tasks
                                            </div>

                                            <div className="student-stat-number">
                                                {stats.totalTasks}
                                            </div>

                                        </div>


                                        <div className="student-stat-icon primary">

                                            <i className="bi bi-list-task"></i>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* SUBMITTED TASKS */}

                        <div className="col-lg-4 col-md-6">

                            <div className="student-stat-card">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>

                                            <div className="student-stat-label">
                                                Submitted Tasks
                                            </div>

                                            <div className="student-stat-number">
                                                {stats.submittedTasks}
                                            </div>

                                        </div>


                                        <div className="student-stat-icon success">

                                            <i className="bi bi-check-circle"></i>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* MISSED TASKS */}

                        <div className="col-lg-4 col-md-6">

                            <div className="student-stat-card">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>

                                            <div className="student-stat-label">
                                                Missed Tasks
                                            </div>

                                            <div className="student-stat-number">
                                                {stats.missedTasks}
                                            </div>

                                        </div>


                                        <div className="student-stat-icon warning">

                                            <i className="bi bi-exclamation-triangle"></i>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ========================================
                        DASHBOARD CONTENT
                    ======================================== */}

                    <div className="row g-4 mt-1">


                        {/* ========================================
                            MY TASKS
                        ======================================== */}

                        <div className="col-lg-8">

                            <div className="student-dashboard-section">


                                {/* SECTION HEADER */}

                                <div className="student-section-header">

                                    <h5 className="student-section-title">
                                        My Tasks
                                    </h5>


                                    <Link
                                        to="/student/tasks"
                                        className="student-section-link"
                                    >
                                        View All
                                    </Link>

                                </div>


                                {/* ========================================
                                    TASKS LOADING
                                ======================================== */}

                                {tasksLoading ? (

                                    <div className="student-empty-state">

                                        <div className="spinner-border text-primary">
                                        </div>

                                        <div className="mt-2">
                                            Loading tasks...
                                        </div>

                                    </div>

                                ) : myTasks.length === 0 ? (

                                    /* ========================================
                                        NO PENDING / MISSED TASKS
                                    ======================================== */

                                    <div className="student-empty-state">

                                        <i className="bi bi-check2-circle"></i>

                                        <div>
                                            All tasks have been submitted.
                                        </div>

                                    </div>

                                ) : (

                                    /* ========================================
                                        TASK LIST
                                    ======================================== */

                                    <div>

                                        {myTasks.map((task) => {

                                            const status =
                                                getTaskStatus(
                                                    task
                                                );


                                            return (

                                                <div
                                                    className="student-task-item"
                                                    key={task.id}
                                                >


                                                    {/* ========================================
                                                        TASK INFO
                                                    ======================================== */}

                                                    <div className="student-task-info">


                                                        {/* TASK TITLE */}

                                                        <div className="student-task-title">

                                                            {task.title}

                                                        </div>


                                                        {/* TASK CREATOR */}

                                                        <div className="student-task-creator">

                                                            <i className="bi bi-person-fill me-1"></i>

                                                            Created by:

                                                            {" "}

                                                            {task.creatorName ||
                                                                "Unknown"}

                                                        </div>


                                                        {/* DEADLINE */}

                                                        <div className="student-task-deadline">

                                                            <i className="bi bi-calendar3 me-1"></i>

                                                            Due:

                                                            {" "}

                                                            {formatDeadline(
                                                                task.deadline
                                                            )}

                                                        </div>

                                                    </div>


                                                    {/* ========================================
                                                        SCORE
                                                    ======================================== */}

                                                    <div className="student-task-score">

                                                        <span>
                                                            {task.maxScore}
                                                        </span>

                                                        {" "}

                                                        pts

                                                    </div>


                                                    {/* ========================================
                                                        STATUS
                                                    ======================================== */}

                                                    <span
                                                        className={
                                                            `student-status ${status}`
                                                        }
                                                    >

                                                        {status ===
                                                            "missed"

                                                            ? "Missed"

                                                            : "Pending"
                                                        }

                                                    </span>

                                                </div>

                                            );

                                        })}

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* ========================================
                            RECENT SUBMISSIONS
                        ======================================== */}

                        <div className="col-lg-4">

                            <div className="student-dashboard-section student-recent-submissions-card">


                                {/* SECTION HEADER */}

                                <div className="student-section-header">

                                    <h5 className="student-section-title">
                                        Recent Submissions
                                    </h5>


                                    <Link
                                        to="/student/submissions"
                                        className="student-section-link"
                                    >
                                        View All
                                    </Link>

                                </div>


                                {/* ========================================
                                    NO SUBMISSIONS
                                ======================================== */}

                                {!tasksLoading &&
                                    recentSubmissions.length === 0 && (

                                        <div className="student-empty-state">

                                            <i className="bi bi-file-earmark-check"></i>

                                            <div>
                                                No recent submissions.
                                            </div>

                                        </div>

                                    )
                                }


                                {/* ========================================
                                    RECENT SUBMISSION LIST
                                ======================================== */}

                                {!tasksLoading &&
                                    recentSubmissions.length > 0 && (

                                        <div className="student-recent-submissions">

                                            {recentSubmissions.map(
                                                (task) => {

                                                    const submission =
                                                        task.submission;


                                                    return (

                                                        <div
                                                            className="student-recent-submission"
                                                            key={
                                                                submission.id
                                                            }
                                                        >


                                                            {/* ========================================
                                                                SUBMISSION ICON
                                                            ======================================== */}

                                                            <div className="student-recent-submission-icon">

                                                                <i className="bi bi-file-earmark-check"></i>

                                                            </div>


                                                            {/* ========================================
                                                                SUBMISSION INFORMATION
                                                            ======================================== */}

                                                            <div className="student-recent-submission-info">

                                                                <div className="student-recent-submission-title">

                                                                    {task.title}

                                                                </div>


                                                                <div className="student-recent-submission-file">

                                                                    <i className="bi bi-paperclip me-1"></i>

                                                                    {getFileName(
                                                                        submission.filePath
                                                                    )}

                                                                </div>


                                                                <div className="student-recent-submission-date">

                                                                    {formatDateTime(
                                                                        submission.submittedAt
                                                                    )}

                                                                </div>

                                                            </div>


                                                            {/* ========================================
                                                                SUBMITTED TAG
                                                            ======================================== */}

                                                            <span className="student-recent-submission-status">

                                                                Submitted

                                                            </span>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )
                                }


                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>

    );

}


export default StudentDashboard;