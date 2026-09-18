import { NavLink } from "react-router-dom";

function AdminSidebar() {

    return (
        <aside className="admin-sidebar">

            <div className="sidebar-menu">

                {/* MAIN */}
                <div className="sidebar-heading">
                    MAIN
                </div>

                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""
                        }`
                    }
                >
                    <i className="bi bi-speedometer2"></i>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/admin/tasks"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""
                        }`
                    }
                >
                    <i className="bi bi-list-task"></i>
                    <span>Tasks</span>
                </NavLink>

                <NavLink
                    to="/admin/submissions"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""
                        }`
                    }
                >
                    <i className="bi bi-file-earmark-check"></i>

                    <span>
                        Submissions
                    </span>
                </NavLink>

            </div>

            {/* SIDEBAR FOOTER */}
            <div className="sidebar-footer">

                <div className="sidebar-footer-icon">
                    <i className="bi bi-shield-check"></i>
                </div>

                <div>

                    <div className="fw-bold">
                        Admin Panel
                    </div>

                    <div className="fw-semibold small">
                        Management System
                    </div>

                </div>

            </div>

        </aside>
    );
}

export default AdminSidebar;