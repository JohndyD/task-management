import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./../css/Login.css";

const LOGIN_URL =
    "http://localhost/task-management/php/login.php";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) {
            return;
        }

        setLoading(true);

        try {

            const response = await axios.post(
                LOGIN_URL,
                {
                    email: email.trim(),
                    password: password
                },
                {
                    withCredentials: true
                }
            );

            const data = response.data;

            if (!data.success) {

                alert(data.message);

                return;
            }

            const user = data.user;

            if (user.role === "student") {

                navigate("/student", {
                    replace: true
                });

            } else if (user.role === "admin") {

                navigate("/admin", {
                    replace: true
                });

            } else {

                alert("Invalid user role.");
            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            alert(
                "Unable to connect to the server."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="login-container">

            <div className="login-card">

                <h1 className="login-title">
                    Task Manager
                </h1>

                <p className="login-subtitle">
                    Login to continue
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                            autoComplete="email"
                        />

                    </div>

                    <div className="mb-3">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                            autoComplete="current-password"
                        />

                    </div>

                    <button
                        type="submit"
                        className="btn login-btn w-100"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;