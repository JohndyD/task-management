import axios from "axios";
import { useNavigate } from "react-router-dom";

const LOGOUT_URL =
    "http://localhost/task-management/php/logout.php";

function AdminNavbar({ user }) {

    const navigate = useNavigate();

    const handleLogout = async () => {

        try {

            await axios.post(
                LOGOUT_URL,
                {},
                {
                    withCredentials: true
                }
            );

        } catch (error) {

            console.error(
                "Logout Error:",
                error
            );
        }

        navigate("/login", {
            replace: true
        });
    };

    return (
        <nav className="admin-navbar">

            <div className="admin-navbar-brand">
                <i className="bi bi-grid-1x2-fill me-2"></i>
                Task Management System
            </div>

            <div className="admin-navbar-user">

                <div className="admin-user-info">

                    <span className="admin-user-name">
                        {user?.name}
                    </span>

                    <span className="admin-user-role">
                        Administrator
                    </span>

                </div>

                <button
                    type="button"
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default AdminNavbar;