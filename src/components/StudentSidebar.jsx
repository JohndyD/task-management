import { NavLink } from "react-router-dom";

function StudentSidebar() {

    return (
        <aside className="admin-sidebar">

            <div className="sidebar-menu">

                {/* ========================================
                    MAIN
                ======================================== */}

                <div className="sidebar-heading">
                    MAIN
                </div>


                {/* DASHBOARD */}
                <NavLink
                    to="/student"
                    end
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""
                        }`
                    }
                >

                    <i className="bi bi-speedometer2"></i>

                    <span>
                        Dashboard
                    </span>

                </NavLink>


                {/* MY TASKS */}
                <NavLink
                    to="/student/tasks"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""
                        }`
                    }
                >
                    <i className="bi bi-list-task"></i>
                    <span>Tasks / Submissions</span>
                </NavLink>

            </div>


            {/* ========================================
                SIDEBAR FOOTER
            ======================================== */}

            <div className="sidebar-footer">

                <div className="sidebar-footer-icon">

                    <i className="bi bi-mortarboard-fill"></i>

                </div>


                <div>

                    <div className="fw-bold">
                        Student Panel
                    </div>

                    <div className="fw-semibold small">
                        Task Management
                    </div>

                </div>

            </div>

        </aside>
    );
}

export default StudentSidebar;