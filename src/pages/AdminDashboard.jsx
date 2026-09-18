import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

import "./../css/AdminLayout.css";


// ========================================
// API URLS
// ========================================

const CHECK_SESSION_URL =
    "http://localhost/task-management/php/check_session.php";

const DASHBOARD_URL =
    "http://localhost/task-management/php/admin/admin_dashboard.php";


function AdminDashboard() {

    const [user, setUser] = useState(null);

    const [dashboard, setDashboard] = useState({

        totalTasks: 0,

        activeTasks: 0,

        dueSoon: 0,

        totalStudents: 0,

        totalSubmissions: 0,

        pendingSubmissions: 0,

        recentSubmissions: []

    });

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();


    // ========================================
    // CHECK SESSION
    // ========================================

    useEffect(() => {

        let mounted = true;


        const checkSession = async () => {

            try {

                const response = await axios.get(
                    CHECK_SESSION_URL,
                    {
                        withCredentials: true
                    }
                );


                const data = response.data;


                // --------------------------------
                // NOT LOGGED IN
                // --------------------------------

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


                // --------------------------------
                // NOT ADMIN
                // --------------------------------

                if (
                    !data.user ||
                    data.user.role !== "admin"
                ) {

                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );

                    return;
                }


                // --------------------------------
                // SET USER
                // --------------------------------

                if (mounted) {

                    setUser(
                        data.user
                    );

                }

            } catch (error) {

                console.error(
                    "Session check error:",
                    error
                );


                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

            }

        };


        checkSession();


        return () => {

            mounted = false;

        };

    }, [navigate]);


    // ========================================
    // GET DASHBOARD DATA
    // ========================================

    useEffect(() => {

        if (!user) {

            return;

        }


        const getDashboardData = async () => {

            try {

                setLoading(true);


                const response = await axios.get(
                    DASHBOARD_URL,
                    {
                        withCredentials: true
                    }
                );


                const data = response.data;


                if (!data.success) {

                    console.error(
                        data.message
                    );

                    return;

                }


                const dashboardData =
                    data.data || {};


                setDashboard({

                    totalTasks:
                        Number(
                            dashboardData.totalTasks
                        ) || 0,


                    activeTasks:
                        Number(
                            dashboardData.activeTasks
                        ) || 0,


                    dueSoon:
                        Number(
                            dashboardData.dueSoon
                        ) || 0,


                    totalStudents:
                        Number(
                            dashboardData.totalStudents
                        ) || 0,


                    totalSubmissions:
                        Number(
                            dashboardData.totalSubmissions
                        ) || 0,


                    pendingSubmissions:
                        Number(
                            dashboardData.pendingSubmissions
                        ) || 0,


                    recentSubmissions:
                        Array.isArray(
                            dashboardData.recentSubmissions
                        )
                            ? dashboardData.recentSubmissions
                            : []

                });


            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );


            } finally {

                setLoading(false);

            }

        };


        getDashboardData();

    }, [user]);


    // ========================================
    // FORMAT DATE
    // ========================================

    const formatDate = (dateString) => {

        if (!dateString) {

            return "-";

        }


        const date = new Date(
            dateString.replace(
                " ",
                "T"
            )
        );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return dateString;

        }


        return date.toLocaleString();

    };


    // ========================================
    // GET STATUS CLASS
    // ========================================

    const getStatusClass = (status) => {

        switch (status) {

            case "graded":

                return "text-success";


            case "submitted":

                return "text-primary";


            case "pending":

                return "text-warning";


            default:

                return "text-secondary";

        }

    };


    // ========================================
    // GET STATUS LABEL
    // ========================================

    const getStatusLabel = (status) => {

        if (!status) {

            return "-";

        }


        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );

    };


    // ========================================
    // LOADING USER
    // ========================================

    if (!user) {

        return (

            <div className="container mt-4">

                <p>
                    Loading...
                </p>

            </div>

        );

    }


    // ========================================
    // DASHBOARD
    // ========================================

    return (

        <div className="admin-layout">


            {/* ========================================
                NAVBAR
            ======================================== */}

            <AdminNavbar
                user={user}
            />


            {/* ========================================
                SIDEBAR
            ======================================== */}

            <AdminSidebar />


            {/* ========================================
                MAIN CONTENT
            ======================================== */}

            <main className="admin-main">

                <div className="admin-content">


                    {/* ========================================
                        HEADER
                    ======================================== */}

                    <div className="dashboard-header">

                        <div>

                            <h2 className="dashboard-title">

                                Welcome Back, {user.name}

                            </h2>


                            <p className="dashboard-subtitle">

                                Monitor tasks, submissions
                                and student activity.

                            </p>

                        </div>


                        <div className="dashboard-date">

                            <i className="bi bi-calendar-event me-2"></i>

                            {new Date().toLocaleDateString()}

                        </div>

                    </div>


                    {/* ========================================
                        DASHBOARD CARDS
                    ======================================== */}

                    <div className="row g-4">


                        {/* ========================================
                            TOTAL TASKS
                        ======================================== */}

                        <div className="col-md-6 col-xl-4">

                            <div className="dashboard-card h-100">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">


                                        <div>

                                            <p className="card-label">

                                                Total Tasks

                                            </p>


                                            <h1 className="card-number">

                                                {loading
                                                    ? "..."
                                                    : dashboard.totalTasks}

                                            </h1>

                                        </div>


                                        <div className="dashboard-icon primary">

                                            <i className="bi bi-list-task"></i>

                                        </div>


                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ========================================
                            ACTIVE TASKS
                        ======================================== */}

                        <div className="col-md-6 col-xl-4">

                            <div className="dashboard-card h-100">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">


                                        <div>

                                            <p className="card-label">

                                                Active Tasks

                                            </p>


                                            <h1 className="card-number">

                                                {loading
                                                    ? "..."
                                                    : dashboard.activeTasks}

                                            </h1>

                                        </div>


                                        <div className="dashboard-icon success">

                                            <i className="bi bi-play-circle"></i>

                                        </div>


                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ========================================
                            TOTAL STUDENTS
                        ======================================== */}

                        <div className="col-md-6 col-xl-4">

                            <div className="dashboard-card h-100">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">


                                        <div>

                                            <p className="card-label">

                                                Total Students

                                            </p>


                                            <h1 className="card-number">

                                                {loading
                                                    ? "..."
                                                    : dashboard.totalStudents}

                                            </h1>

                                        </div>


                                        <div className="dashboard-icon primary">

                                            <i className="bi bi-people"></i>

                                        </div>


                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ========================================
                            TOTAL SUBMISSIONS
                        ======================================== */}

                        <div className="col-md-6 col-xl-6">

                            <div className="dashboard-card h-100">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">


                                        <div>

                                            <p className="card-label">

                                                Total Submissions

                                            </p>


                                            <h1 className="card-number">

                                                {loading
                                                    ? "..."
                                                    : dashboard.totalSubmissions}

                                            </h1>


                                            <small className="text-muted">

                                                Resubmissions excluded

                                            </small>

                                        </div>


                                        <div className="dashboard-icon success">

                                            <i className="bi bi-file-earmark-check"></i>

                                        </div>


                                    </div>

                                </div>

                            </div>

                        </div>
                       


                        {/* ========================================
                            DUE WITHIN 7 DAYS
                        ======================================== */}

                        <div className="col-md-6 col-xl-6">

                            <div className="dashboard-card h-100">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">


                                        <div>

                                            <p className="card-label">

                                                Due Within 7 Days

                                            </p>


                                            <h1 className="card-number">

                                                {loading
                                                    ? "..."
                                                    : dashboard.dueSoon}

                                            </h1>

                                        </div>


                                        <div className="dashboard-icon danger">

                                            <i className="bi bi-calendar2-week"></i>

                                        </div>


                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ========================================
                        RECENT SUBMISSIONS
                    ======================================== */}

                    <div className="dashboard-section mt-4">


                        <div className="dashboard-section-header">

                            <div>

                                <h5 className="dashboard-section-title">

                                    Recent Submissions

                                </h5>


                                <p className="dashboard-section-subtitle">

                                    Most recent submission from each student

                                </p>

                            </div>

                        </div>


                        <div className="dashboard-card">

                            <div className="table-responsive">

                                <table className="table align-middle mb-0">


                                    {/* TABLE HEADER */}

                                    <thead>

                                        <tr>

                                            <th>
                                                Student
                                            </th>

                                            <th>
                                                Task
                                            </th>

                                            <th>
                                                Submitted
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Score
                                            </th>

                                        </tr>

                                    </thead>


                                    {/* TABLE BODY */}

                                    <tbody>


                                        {/* LOADING */}

                                        {loading ? (

                                            <tr>

                                                <td
                                                    colSpan="5"
                                                    className="text-center py-4"
                                                >

                                                    Loading submissions...

                                                </td>

                                            </tr>

                                        )


                                        /* EMPTY */

                                        : dashboard.recentSubmissions.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="5"
                                                    className="text-center py-4 text-muted"
                                                >

                                                    No submissions yet.

                                                </td>

                                            </tr>

                                        )


                                        /* DATA */

                                        : (

                                            dashboard.recentSubmissions.map(
                                                (submission) => (

                                                    <tr
                                                        key={
                                                            submission.id
                                                        }
                                                    >


                                                        {/* STUDENT */}

                                                        <td>

                                                            <strong>

                                                                {
                                                                    submission.studentName ||
                                                                    "-"
                                                                }

                                                            </strong>

                                                        </td>


                                                        {/* TASK */}

                                                        <td>

                                                            {
                                                                submission.taskTitle ||
                                                                "-"
                                                            }

                                                        </td>


                                                        {/* DATE */}

                                                        <td>

                                                            {formatDate(
                                                                submission.submittedAt
                                                            )}

                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            <span
                                                                className={`fw-semibold ${getStatusClass(
                                                                    submission.status
                                                                )}`}
                                                            >

                                                                {
                                                                    getStatusLabel(
                                                                        submission.status
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* SCORE */}

                                                        <td>

                                                            {
                                                                submission.score !== null &&
                                                                submission.score !== undefined
                                                                    ? submission.score
                                                                    : "-"
                                                            }

                                                        </td>


                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>

    );

}


export default AdminDashboard;